import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes';
import { gRecaptchaController } from './app/modules/gRecaptcha/gRecaptcha.controller';
import { stripeWebhook } from './app/modules/stripe/stripeWebhook';
// import { stripeWebhookHandler } from './app/modules/stripe/stripeWebhook';

const app: Application = express();
app.use(
  cors({
    origin: [
      'http://localhost:3001',
      'http://104.236.194.254:5700',
      'http://localhost:3000',
      'http://localhost:5700',
      'https://my-app-nine-tau-26.vercel.app',
      'https://www.worldcybersecurityforum.org',
      'https://worldcybersecurityforum.org',
      "http://localhost:5173",
      "https://jodeyinka.code-commando.com",
      "*"
    ],
    credentials: true,
  }),
);
app.post(
  "/api/v1/webhook",
  express.raw({ type: "application/json" }), // stripe expects raw body
  // stripeWebhookHandler
  stripeWebhook
);
//parser
app.use(express.json({ limit: '5000mb' }));
app.use(express.urlencoded({ limit: '5000mb', extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send({
    Message: 'The server is running. . .',
  });
});

app.use(gRecaptchaController.validateRecaptchaTokenMiddleware);
app.use('/api/v1', router);
app.use(globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API NOT FOUND!',
    error: {
      path: req.originalUrl,
      message: 'Your requested path is not found!',
    },
  });
});

export default app;

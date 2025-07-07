import express from 'express';
import { stripeController } from './stripe.controller';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post('/subscription', auth(), stripeController.createPaymentSession);


export const stripeRoute = router;

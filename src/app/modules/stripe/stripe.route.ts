import express from 'express';
import { stripeController } from './stripe.controller';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post('/subscription', auth(), stripeController.createPaymentSession);
router.post('/cancel-subscription', stripeController.cancelUserSubscription); // ✅ নতুন route

export const stripeRoute = router;

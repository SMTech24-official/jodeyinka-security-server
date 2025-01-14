import express from 'express';
import { paypalControllers } from './paypal.controller';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post('/pay', auth(), paypalControllers.createPaymentSession);
router.patch('/complete-order', auth(), paypalControllers.completeOrder);

export const paypalRouter = router;

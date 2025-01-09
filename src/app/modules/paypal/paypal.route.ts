import express from 'express';
import { paypalControllers } from './paypal.controller';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post('/pay', auth(), paypalControllers.createPaymentSession);
router.get('/complete-order', paypalControllers.completeOrder);

export const paypalRouter = router;

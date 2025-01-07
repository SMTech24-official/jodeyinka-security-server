import express from 'express';
import { squareControllers } from './square.controller';

const router = express.Router();

router.route('/').post(squareControllers.createPaymentSession);

export const squareRouter = router;

import express from 'express';
import { squareControllers } from './square.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router
  .route('/pay')
  .post(auth(), squareControllers.createOneTimePaymentSession);
router
  .route('/pay/event/:eventId')
  .post(auth(), squareControllers.createOneTimePaymentSessionSponsorship);
export const squareRouter = router;

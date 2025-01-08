import express from 'express';
import { squareControllers } from './square.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router
  .route('/pay')
  .post(auth(), squareControllers.createOneTimePaymentSession);
router.route('/subscribe');
export const squareRouter = router;

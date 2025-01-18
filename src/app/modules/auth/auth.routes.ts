import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthControllers } from './auth.controller';
import { authValidation } from './auth.validation';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post(
  '/login',
  validateRequest(authValidation.loginUser),
  AuthControllers.loginUser,
);

router.get('/refresh-token', auth(), AuthControllers.refreshToken);
router.post('/forgot-password', AuthControllers.forgotPassword);
router.post('/enter-otp', AuthControllers.enterOTP);
router.post('/reset-password', AuthControllers.resetPassword);

export const AuthRouter = router;

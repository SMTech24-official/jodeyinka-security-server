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
router.post(
  '/mobile-login',
  validateRequest(authValidation.loginUser),
  AuthControllers.mobileLogin,
);
router.post(
  '/googleLogin',
  validateRequest(authValidation.googleLoginUser),
  AuthControllers.googleLoginUser,
);

router.get('/refresh-token', auth(), AuthControllers.refreshToken);
router.post('/forgot-password', AuthControllers.forgotPassword);
router.post('/enter-otp', AuthControllers.enterOTP);
router.post('/verify-otp', AuthControllers.verify2faOTP);
router.post('/mobile-verify-otp', AuthControllers.mobileVerifyOTP);
router.post('/resend-otp', AuthControllers.twoFactor);
router.post('/reset-password', AuthControllers.resetPassword);

export const AuthRouter = router;

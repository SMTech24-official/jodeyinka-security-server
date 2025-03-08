import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';
import { Request, Response } from 'express';

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUserFromDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthServices.forgotPassword(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP sent to the email, please check your email.',
    data: result,
  });
});

const enterOTP = catchAsync(async (req: Request, res: Response) => {
  const { otp } = req.body;
  const result = await AuthServices.enterOTP(otp);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP verified successfully.',
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, otp, password } = req.body;
  const result = await AuthServices.resetPassword(email, otp, password);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password changed successfully.',
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const refreshToken = await AuthServices.refreshToken(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Refresh token generated successfully.',
    data: refreshToken,
  });
});

export const AuthControllers = {
  loginUser,
  forgotPassword,
  enterOTP,
  resetPassword,
  refreshToken,
};

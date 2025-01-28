import axios from 'axios';
import catchAsync from '../../utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
const validateRecaptchaTokenMiddleware = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const secretKey = '6Le_DLoqAAAAAE-fEnoGMVjYpTePI8mIXCpRBxyL'; // Replace with your reCAPTCHA secret key
    const token =
      req.body['g-recaptcha-response'] || req.headers['g-recaptcha-response'];
    if (!token) {
      return next();
    }
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
    );
    const data = response.data;
    console.error(data);

    if (data.success) {
      next(); // reCAPTCHA verification succeeded, proceed to the next middleware
    } else {
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Recaptcha verification failed.',
        data: data['error-codes'],
      });
    }
  },
);
export const gRecaptchaController = {
  validateRecaptchaTokenMiddleware,
};

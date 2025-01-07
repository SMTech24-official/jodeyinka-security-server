import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { squareServices } from './square.service';

const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const result = await squareServices.createPaymentSession();
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Square payment session created successfully.',
    data: result,
  });
});

export const squareControllers = {
  createPaymentSession,
};

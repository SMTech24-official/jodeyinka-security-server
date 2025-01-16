import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { paypalService } from './paypal.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { TransactionTypeEnum } from '@prisma/client';

const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { purpose, amount } = req.body;
  const result = await paypalService.createPaymentSession(
    amount,
    userId,
    purpose,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Payment created successfully.',
    data: result,
  });
});

const completeOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const orderId = req.query.token as string;
  const purpose = req.query.purpose as TransactionTypeEnum;
  const result = await paypalService.completeOrder(userId, orderId, purpose);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Membership purchase successful.',
    data: result,
  });
});

export const paypalControllers = {
  createPaymentSession,
  completeOrder,
};

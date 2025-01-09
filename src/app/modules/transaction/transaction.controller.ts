import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { transactionServices } from './transaction.service';

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const transactions = await transactionServices.getAllTransactions();

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Resource created successfully.',
    data: transactions,
  });
});

export const transactionControllers = {
  getAllTransactions,
};

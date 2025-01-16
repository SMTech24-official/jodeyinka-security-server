import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { transactionServices } from './transaction.service';
import pickValidFields from '../../utils/pickValidFields';

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = pickValidFields(req.query, ['limit', 'page']);
  const transactions =
    await transactionServices.getAllTransactions(paginationOptions);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Resource created successfully.',
    data: transactions,
  });
});

const getUserTransactions = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = pickValidFields(req.query, ['limit', 'page']);
  const userId = req.user.id;
  const transactions = await transactionServices.getUserTransactions(
    userId,
    paginationOptions,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User transactions retrieved successfully.',
    data: transactions,
  });
});

const totalAmountAggregate = catchAsync(async (req: Request, res: Response) => {
  const result = await transactionServices.getAmountAggregate();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transactions aggregate retrieved successfully.',
    data: result,
  });
});

export const transactionControllers = {
  getAllTransactions,
  getUserTransactions,
  totalAmountAggregate,
};

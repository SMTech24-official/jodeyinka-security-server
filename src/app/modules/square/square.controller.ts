import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { squareServices } from './square.service';

const createOneTimePaymentSession = catchAsync(
  async (req: Request, res: Response) => {
    const { sourceId, amount, purpose, userId } = req.body;
    // const userId = req.user.id;
    const result = await squareServices.createOneTimePaymentSession(
      amount,
      sourceId,
      purpose,
      userId,
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Square payment session created successfully.',
      data: result,
    });
  },
);

export const squareControllers = {
  createOneTimePaymentSession,
};

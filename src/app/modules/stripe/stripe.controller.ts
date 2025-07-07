import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { stripeService } from './stripe.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id; // Authenticated user থেকে id নিতে হবে (middleware থেকে)
  const { priceId, type } = req.body;

  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  if (!priceId || !type) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'priceId and type are required',
    });
  }

  const session = await stripeService.createPaymentSession(priceId, userId, type);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Stripe payment session created successfully.',
    data: session,
  });
});

export const stripeController = {
  createPaymentSession,
};

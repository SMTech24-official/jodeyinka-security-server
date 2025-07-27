import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { stripeService } from './stripe.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { priceId, type } = req.body;

  if (!userId || !priceId || !type) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'userId, priceId and type are required',
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

const cancelUserSubscription = catchAsync(async (req: Request, res: Response) => {
  const { checkoutSessionId } = req.body;

  if (!checkoutSessionId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'checkoutSessionId is required',
    });
  }

  const result = await stripeService.cancelSubscription(checkoutSessionId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Subscription cancelled successfully',
    data: result,
  });
});

export const stripeController = {
  createPaymentSession,
  cancelUserSubscription,
};

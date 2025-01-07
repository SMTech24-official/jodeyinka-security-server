import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { captureOrder, createOrder } from '../../helpers/paypal';
import prisma from '../../utils/prisma';

const createPaymentSession = async (userId: string) => {
  const session = await createOrder(userId);
  return session;
};

const completeOrder = async (userId: string, orderId: string) => {
  const payment = await captureOrder(orderId);
  if (payment.status === 'COMPLETED') {
    const newUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isMember: true,
      },
    });

    return;
  }
  throw new AppError(httpStatus.BAD_REQUEST, 'Payment failed.');
};

export const paypalService = {
  createPaymentSession,
  completeOrder,
};

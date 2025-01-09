import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import {
  captureOrder,
  createOrder,
  getPaypalOrder,
} from '../../helpers/paypal';
import prisma from '../../utils/prisma';

const createPaymentSession = async (userId: string, purpose: string) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      userId: userId,
      type: 'MEMBERSHIP',
    },
  });
  if (transaction) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already paid for the membership.',
    );
  }
  const session = await createOrder(userId, purpose);
  return session;
};

const completeOrder = async (
  userId: string,
  orderId: string,
  purpose: string,
) => {
  const payment = await captureOrder(orderId);
  if (payment.status === 'COMPLETED') {
    await prisma.$transaction(async prisma => {
      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isMember: true,
        },
      });

      const newTransaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          paymentId: orderId,
          amount: Number(
            payment.purchase_units[0].payments.captures[0].amount.value,
          ),
          type: purpose,
          method: 'Paypal',
          currency:
            payment.purchase_units[0].payments.captures[0].amount.currency_code,
        },
      });
    });

    return;
  }
  throw new AppError(
    httpStatus.BAD_REQUEST,
    'Payment failed. Please try again',
  );
};

export const paypalService = {
  createPaymentSession,
  completeOrder,
};

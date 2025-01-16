import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import {
  captureOrder,
  createOrder,
  getPaypalOrder,
} from '../../helpers/paypal';
import prisma from '../../utils/prisma';
import { TransactionTypeEnum, UserRoleEnum } from '@prisma/client';

const createPaymentSession = async (
  amount: string,
  userId: string,
  purpose: string,
) => {
  if (purpose === 'MEMBERSHIP') {
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
  }
  if (purpose === 'MEMBERSHIP' && Number(amount) !== 1) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Membership payment is 1$.');
  }
  const session = await createOrder(amount, userId, purpose);
  return session;
};

const completeOrder = async (
  userId: string,
  orderId: string,
  purpose: TransactionTypeEnum,
) => {
  const payment = await captureOrder(orderId);
  if (payment.status === 'COMPLETED') {
    await prisma.$transaction(async prisma => {
      if (purpose === 'MEMBERSHIP') {
        const user = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            role: UserRoleEnum.MEMBER,
          },
        });
      }

      const newTransaction = await prisma.transaction.create({
        data: {
          userId: userId,
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

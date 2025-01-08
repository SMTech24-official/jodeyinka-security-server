import httpStatus from 'http-status';
import { client } from '../../../config/square.config';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';

const createOneTimePaymentSession = async (
  amount: number,
  sourceId: string,
  purpose: string,
  userId: string,
) => {
  if (!amount) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Amount not defined.');
  }
  const response = await client.paymentsApi.createPayment({
    sourceId,
    idempotencyKey: new Date().getTime().toString(),
    amountMoney: {
      amount: BigInt(amount),
      currency: 'USD',
    },
    note: `Payment for ${purpose} by user ${userId}.`,
  });

  if (response.result.payment?.status === 'COMPLETED') {
    if (purpose === 'MEMBERSHIP') {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isMember: true,
        },
      });
    }
  }
  return;
};

const createSubscriptionSession = async () => {};

export const squareServices = {
  createOneTimePaymentSession,
  createSubscriptionSession,
};

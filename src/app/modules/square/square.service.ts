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
            paymentId: response.result.payment?.id as string,
            amount: Number(response.result.payment?.amountMoney?.amount),
            type: purpose,
            method: 'SquareUp',
            currency: response.result.payment?.amountMoney?.currency as string,
          },
        });
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

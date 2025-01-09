import httpStatus from 'http-status';
import { client } from '../../../config/square.config';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { EventSponsorTier } from '@prisma/client';
import { bigint } from 'square/dist/types/schema';

const createOneTimePaymentSession = async (
  amount: number,
  sourceId: string,
  purpose: string,
  userId: string,
) => {
  if (!amount) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Amount not defined.');
  }
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
    await prisma.$transaction(async prisma => {
      if (purpose === 'MEMBERSHIP') {
        const user = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            isMember: true,
          },
        });
      }
      const newTransaction = await prisma.transaction.create({
        data: {
          userId: userId,
          paymentId: response.result.payment?.id as string,
          amount: Number(response.result.payment?.amountMoney?.amount),
          type: purpose,
          method: 'SquareUp',
          currency: response.result.payment?.amountMoney?.currency as string,
        },
      });
    });
  }
  return;
};

const createOneTimePaymentSessionSponsorship = async (
  amount: number,
  sourceId: string,
  tier: EventSponsorTier,
  userId: string,
  eventId: string,
) => {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      date: {
        gt: new Date(),
      },
    },
  });
  if (!event) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This event is not available anymore.',
    );
  }
  //Silver
  if (tier == EventSponsorTier.SILVER) {
    if (!event.silverSponsorAvailable) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Silver sponsorship for the event is not available anymore.',
      );
    }
    if (event.silverSponsorFee !== amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Invalid amount, please provide the correct amount.',
      );
    }
    event.silverSponsorAvailable = false;
  }
  // Gold
  else if (tier == EventSponsorTier.GOLD) {
    if (!event.goldSponsorAvailable) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Gold sponsorship for the event is not available anymore.',
      );
    }
    if (event.goldSponsorFee !== amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Invalid amount, please provide the correct amount.',
      );
    }
    event.goldSponsorAvailable = false;
  }
  // Platinum
  else if (tier == EventSponsorTier.PLATINUM) {
    if (!event.platinumSponsorAvailable) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Platinum sponsorship for the event is not available anymore.',
      );
    }
    if (event.platinumSponsorFee !== amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Invalid amount, please provide the correct amount.',
      );
    }
    event.platinumSponsorAvailable = false;
  }

  const response = await client.paymentsApi.createPayment({
    sourceId,
    idempotencyKey: new Date().getTime().toString(),
    amountMoney: {
      amount: BigInt(amount),
      currency: 'USD',
    },
  });
  if (response.result.payment?.status === 'COMPLETED') {
    await prisma.$transaction(async prisma => {
      await prisma.eventSponsor.create({
        data: {
          tier: tier,
          fee: Number(response.result.payment?.amountMoney?.amount),
          eventId: event.id,
          sponsorId: userId,
        },
      });
      await prisma.event.update({
        where: {
          id: event.id,
        },
        data: {
          silverSponsorAvailable: event.silverSponsorAvailable,
          goldSponsorAvailable: event.goldSponsorAvailable,
          platinumSponsorAvailable: event.platinumSponsorAvailable,
        },
      });
    });
    await prisma.transaction.create({
      data: {
        userId: userId,
        paymentId: response.result.payment.id as string,
        amount: amount,
        type: 'SPONSORSHIP',
        currency: 'USD',
        method: 'SquareUp',
      },
    });
  }
  return;
};

export const squareServices = {
  createOneTimePaymentSession,
  createOneTimePaymentSessionSponsorship,
};

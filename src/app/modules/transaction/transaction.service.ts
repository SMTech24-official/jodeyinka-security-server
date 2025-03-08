import { IPaginationOptions } from '../../interface/pagination.type';
import { calculatePagination } from '../../utils/calculatePagination';
import prisma from '../../utils/prisma';

const getAllTransactions = async (paginationOptions: IPaginationOptions) => {
  const { limit, skip } = calculatePagination(paginationOptions);
  const transactions = await prisma.transaction.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: limit,
  });
  return transactions;
};

const getUserTransactions = async (
  userId: string,
  paginationOptions: IPaginationOptions,
) => {
  const { limit, skip } = calculatePagination(paginationOptions);
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: userId,
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });
  return transactions;
};

const getAmountAggregate = async () => {
  const totalAmount = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
  });
  const totalMember = await prisma.transaction.aggregate({
    where: {
      type: 'MEMBERSHIP',
    },
    _sum: {
      amount: true,
    },
  });
  const totalSponsor = await prisma.transaction.aggregate({
    where: {
      type: 'SPONSORSHIP',
    },
    _sum: {
      amount: true,
    },
  });
  return { totalAmount, totalMember, totalSponsor };
};

const aboutUsAggregate = async () => {
  const membersCount = await prisma.user.count({
    where: {
      role: 'MEMBER',
    },
  });
  const sponsorsCount = await prisma.user.count({
    where: {
      role: 'SPONSOR',
    },
  });
  const organizedEventsCount = await prisma.event.count({
    where: {
      date: {
        lt: new Date(),
      },
    },
  });
  const resourcesCount = await prisma.resource.count({});
  return {
    membersCount,
    sponsorsCount,
    organizedEventsCount,
    resourcesCount,
  };
};
export const transactionServices = {
  getAllTransactions,
  getUserTransactions,
  getAmountAggregate,
  aboutUsAggregate,
};

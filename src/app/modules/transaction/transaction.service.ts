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
export const transactionServices = {
  getAllTransactions,
  getUserTransactions,
  getAmountAggregate,
};

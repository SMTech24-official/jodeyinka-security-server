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
  const result = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    _count: {
      _all: true,
    },
  });
};
export const transactionServices = {
  getAllTransactions,
  getUserTransactions,
};

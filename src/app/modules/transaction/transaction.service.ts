import prisma from '../../utils/prisma';

const getAllTransactions = async () => {
  const transactions = await prisma.transaction.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return transactions;
};

const getUserTransactions = async (userId: string) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: userId,
    },
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

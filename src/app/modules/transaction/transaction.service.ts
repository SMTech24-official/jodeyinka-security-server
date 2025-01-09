import prisma from '../../utils/prisma';

const getAllTransactions = async () => {
  const transactions = await prisma.transaction.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return transactions;
};

export const transactionServices = {
  getAllTransactions,
};

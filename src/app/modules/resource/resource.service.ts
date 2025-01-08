import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';

const createResource = async (
  userId: string,
  payload: any,
  fileUrl: string,
) => {
  const resource = await prisma.resource.create({
    data: {
      ...payload,
      authorId: userId,
      fileUrl,
    },
  });
  return resource;
};

export const resourceServices = {
  createResource,
};

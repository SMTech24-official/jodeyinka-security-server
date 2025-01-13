import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { ResourceType } from '@prisma/client';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelpers } from '../../helpers/paginationHelper';

const createResource = async (
  userId: string,
  payload: any,
  fileUrl: string,
  type: string,
) => {
  const resource = await prisma.resource.create({
    data: {
      ...payload,
      authorId: userId,
      fileUrl,
      type: type,
    },
  });
  return resource;
};

const getResources = async (
  type: string,
  paginationOptions: IPaginationOptions,
) => {
  const { limit, skip } =
    paginationHelpers.calculatePagination(paginationOptions);
  const resources = await prisma.resource.findMany({
    where: {
      type: type as ResourceType,
    },
    skip,
    take: limit,
  });
  return resources;
};

const getSingleResource = async (resourceId: string) => {
  const resources = await prisma.resource.findFirst({
    where: {
      id: resourceId,
    },
    include: {
      Comments: {
        select: {
          Author: {
            select: {
              userName: true,
              avatarUrl: true,
            },
          },
          content: true,
          createdAt: true,
        },
      },
      Author: {
        select: {
          firstName: true,
          lastName: true,
          avatarUrl: true,
          userName: true,
        },
      },
    },
  });
  return resources;
};

const createCommentOnResource = async (
  payload: any,
  userId: string,
  resourceId: string,
) => {
  const comment = prisma.comment.create({
    data: {
      ...payload,
      authorId: userId,
      resourceId,
    },
  });
  return comment;
};

const getCommentsOnResource = async (resourceId: string) => {
  return;
};

export const resourceServices = {
  createResource,
  getResources,
  getSingleResource,
  createCommentOnResource,
  getCommentsOnResource,
};

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
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      Author: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  return resources;
};

const getResourcesForMobile = async (

  paginationOptions: IPaginationOptions,
  searchparam: string,
) => {
  const { limit, skip } =
    paginationHelpers.calculatePagination(paginationOptions);
  const resources = await prisma.resource.findMany({
    where: {
      OR: [
        { title: { contains: searchparam, mode: 'insensitive' } },
        { description: { contains: searchparam, mode: 'insensitive' } },

      ],
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      Author: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  return resources;
};

const getUserResources = async (
  userId: string,
  type: string,
  paginationOptions: IPaginationOptions,
) => {
  const { limit, skip } =
    paginationHelpers.calculatePagination(paginationOptions);
  const resources = await prisma.resource.findMany({
    where: {
      type: type as ResourceType,
      authorId: userId,
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      Author: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  return resources;
};

const getSingleResource = async (resourceId: string) => {
  const resource = await prisma.resource.findFirst({
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
  return resource;
};

const deleteSingleResource = async (resourceId: string) => {
  const resource = await prisma.resource.delete({
    where: {
      id: resourceId,
    },
  });
  return resource;
};

const updateSingleResource = async (resourceId: string, payload: any) => {
  const resource = await prisma.resource.update({
    where: {
      id: resourceId,
    },
    data: {
      ...payload,
    },
  });
  return resource;
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
  const comments = await prisma.resource.findFirst({
    where: {
      id: resourceId,
    },
    select: {
      Comments: {
        select: {
          id: true,
          Author: {
            select: {
              id: true,
              firstName: true,
              userName: true,
              avatarUrl: true,
            },
          },
          content: true,
          createdAt: true,
        },
      },
    },
  });
  return comments;
};


const myComments = async (userId: string) => {
  const comments = await prisma.comment.findMany({
    where: { authorId: userId },
    select: {
    content:true,
    createdAt:true,
      Resource: {
        select: {
          Author:{select:{image:true,firstName:true,lastName:true,userFullName:true}}
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return comments;
};

const getTrendingResources = async () => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const trendingResources = await prisma.comment.groupBy({
    by: ['resourceId'],
    where: {
      createdAt: {
        gte: oneWeekAgo,
      },
    },
    _count: {
      resourceId: true,
    },
    orderBy: {
      _count: {
        resourceId: 'desc',
      },
    },
    take: 10,
  });

  const resources = await prisma.resource.findMany({
    where: {
      id: {
        in: trendingResources.map(resource => resource.resourceId),
      },
    },
  });

  return resources;
};

export const resourceServices = {
  createResource,
  getResources,
  getUserResources,
  getSingleResource,
  updateSingleResource,
  deleteSingleResource,
  createCommentOnResource,
  getCommentsOnResource,
  getTrendingResources,
  getResourcesForMobile,
  myComments
};

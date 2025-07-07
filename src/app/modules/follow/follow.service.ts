import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';

const followUser = async (followerId: string, followingId: string) => {
  if (followerId === followingId) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot follow yourself");
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (existingFollow) {
    throw new AppError(httpStatus.CONFLICT, "You are already following this user");
  }

  const follow = await prisma.follow.create({
    data: {
      followerId,
      followingId,
    },
  });

  return follow;
};

const unfollowUser = async (followerId: string, followingId: string) => {
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (!existingFollow) {
    throw new AppError(httpStatus.NOT_FOUND, "You are not following this user");
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  return true;
};

const getFollowers = async (userId: string) => {
  return prisma.follow.findMany({
    where: {
      followingId: userId,
    },
    include: {
      follower: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          avatarUrl: true,
        },
      },
    },
  });
};

const getFollowing = async (userId: string) => {
  return prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    include: {
      following: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          avatarUrl: true,
        },
      },
    },
  });
};

export const followService = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};

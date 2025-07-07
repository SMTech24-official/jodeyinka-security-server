import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { followService } from './follow.service';

const followUser = catchAsync(async (req: Request, res: Response) => {
 
  const { followingId,followerId } = req.body;

  const follow = await followService.followUser(followerId, followingId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User followed successfully',
    data: follow,
  });
});

const unfollowUser = catchAsync(async (req: Request, res: Response) => {
 
  const { followingId,followerId } = req.body;

    const result= await followService.unfollowUser(followerId, followingId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User unfollowed successfully',
    data:result
  });
});

const getFollowers = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const followers = await followService.getFollowers(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Followers retrieved successfully',
    data: followers,
  });
});

const getFollowing = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const following = await followService.getFollowing(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Following list retrieved successfully',
    data: following,
  });
});

export const followController = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};

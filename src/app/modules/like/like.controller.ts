import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import {  likeService } from './like.service';


const toggleLike = catchAsync(async (req: Request, res: Response) => {
  
  const { resourceId,userId } = req.body;

  const result = await likeService.toggleLike(userId, resourceId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data || null,
  });
});
const likeResourceOwner = catchAsync(async (req: Request, res: Response) => {
  
  const {userId } = req.params;

  const result = await likeService.likeResourceOwner(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data || null,
  });
});


export const likeController={
  toggleLike,
  likeResourceOwner
}
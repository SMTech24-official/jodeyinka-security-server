// src/app/modules/MessagingSystem/messagingSystem.controller.ts

import { Request, Response } from 'express';

import httpStatus from 'http-status';
import { MessagingSystemService } from './messagingSystem.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

// ✅ Get all messages for a user
 const getMyMessages = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId; // তুমি যদি auth middleware use করো
  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }

  const result = await MessagingSystemService.getMyMessages(userId,req.params.senderId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User messages retrieved successfully',
    data: result,
  });
});

// ✅ Get all notifications for a user
const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId; // তুমি যদি auth middleware use করো
  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }

  const result = await MessagingSystemService.getMyNotifications(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User notifications retrieved successfully',
    data: result,
  });
});


const getMyChatSidebar = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const chatList = await MessagingSystemService.getMyChatList(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chat list retrieved successfully',
    data: chatList,
  });
});

const getMessagesBetweenUsers = catchAsync(async (req: Request, res: Response) => {
 const { userId1, userId2 } = req.params;
  const chatList = await MessagingSystemService.getMessagesBetweenUsers(userId1,userId2);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chat list retrieved successfully',
    data: chatList,
  });
});


export const MessagingSystemController = {
  getMyMessages,   getMyNotifications ,getMyChatSidebar,getMessagesBetweenUsers}
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { notificationServices } from './notification.service';

const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const notifications = await notificationServices.getNotifications();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications retrieved successfully.',
    data: notifications,
  });
});

const getMyNotification = catchAsync(async (req: Request, res: Response) => {
  const notifications = await notificationServices.getMyNotification(req?.params?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'my Notifications retrieved successfully.',
    data: notifications,
  });
});


export const notificationControllers = {
  getNotifications,
  getMyNotification
};

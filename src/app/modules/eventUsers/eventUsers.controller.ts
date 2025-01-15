import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { eventUsersServices } from './eventUsers.service';

const registerUserToEvent = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { eventId } = req.params;
  const eventUser = await eventUsersServices.registerUserToEvent(
    userId,
    eventId,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Registered to event successfully.',
    data: eventUser,
  });
});

const getUserRegisteredEvents = catchAsync(
  async (req: Request, res: Response) => {
    const transactions = await eventUsersServices.getAllTransactions();

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Resource created successfully.',
      data: transactions,
    });
  },
);

const getUserTransactions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const transactions = await eventUsersServices.getUserTransactions(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User transactions retrieved successfully.',
    data: transactions,
  });
});

export const eventUsersController = {
  getUserRegisteredEvents,
  registerUserToEvent,
  getUserTransactions,
};

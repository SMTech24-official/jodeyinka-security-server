import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { eventUsersServices } from './eventUsers.service';
import pickValidFields from '../../utils/pickValidFields';

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

const getRegisteredEvents = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const paginationOptions = pickValidFields(req.query, ['limit', 'page']);
  const upcomingEvents = await eventUsersServices.getRegisteredEvents(
    userId,
    paginationOptions,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User registered events retrieved successfully.',
    data: upcomingEvents,
  });
});

export const eventUsersController = {
  registerUserToEvent,
  getRegisteredEvents,
};

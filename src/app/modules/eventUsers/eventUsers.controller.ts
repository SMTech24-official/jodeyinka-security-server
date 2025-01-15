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

export const eventUsersController = {
  registerUserToEvent,
};

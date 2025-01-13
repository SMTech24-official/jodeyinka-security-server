import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { eventServices } from './event.service';
import { uploadToS3 } from '../../helpers/fileUploaderToS3';

const createEvent = catchAsync(async (req: Request, res: Response) => {
  const hostId = req.user.id;
  let fileUrl = '';
  if (req.file) {
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;
    fileUrl = await uploadToS3(fileBuffer, originalName, mimeType);
  }
  const result = await eventServices.createEvent(
    JSON.parse(req.body.body),
    fileUrl,
    hostId,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Event created successfully.',
    data: result,
  });
});

const getUpcomingEvents = catchAsync(async (req: Request, res: Response) => {
  const upcomingEvents = await eventServices.getUpcomingEvents();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Upcoming events retrieved successfully.',
    data: upcomingEvents,
  });
});

const getSingleEvent = catchAsync(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const event = await eventServices.getSingleEvent(eventId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event retrieved successfully.',
    data: event,
  });
});
export const eventControllers = {
  createEvent,
  getUpcomingEvents,
  getSingleEvent,
};

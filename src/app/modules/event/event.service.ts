import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { paginationHelpers } from '../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interface/pagination.type';
import prisma from '../../utils/prisma';

const createEvent = async (payLoad: any, fileUrl: any, hostId: string) => {
  if (new Date(payLoad.date) < new Date()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Event start date cannot be less that current date.',
    );
  }
  if (new Date(payLoad.endTime) < new Date(payLoad.date)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Event end time cannot be less that start time.',
    );
  }
  const event = await prisma.event.create({
    data: {
      ...payLoad,
      hostId: hostId,
      imageUrl: fileUrl,
    },
  });
  return event;
};

const getUpcomingEvents = async (paginationOptions: IPaginationOptions) => {
  const { limit, skip } =
    paginationHelpers.calculatePagination(paginationOptions);
  const events = await prisma.event.findMany({
    where: {
      date: {
        gt: new Date(),
      },
    },
    orderBy: {
      date: 'desc',
    },
    skip,
    take: limit,
  });
  return events;
};

const getAllEvents = async (searchParams: string|any, paginationOptions: IPaginationOptions) => {
  const { limit, skip } = paginationHelpers.calculatePagination(paginationOptions);

  const events = await prisma.event.findMany({
    where: {
      title: {
        contains: searchParams, // partial match
        mode: "insensitive",    // case-insensitive search (optional)
      },
    },
     orderBy: {
      createdAt: 'desc',
    },
    select: {host: true, id: true, title: true, date: true, imageUrl: true,description: true}, 
    skip,
    take: limit,
  });

  return events;
  
};

const getSingleEvent = async (eventId: string, userId: string) => {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
    },
    include: {
      host: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          EventsUser: true,
        },
      },
    },
  });
  const isUserRegistered =
    (await prisma.eventsUser.count({
      where: { userId: userId, eventId: eventId },
    })) > 0;
  return { event, isUserRegistered };
};
export const eventServices = {
  createEvent,
  getUpcomingEvents,
  getSingleEvent,
  getAllEvents
};

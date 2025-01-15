import { paginationHelpers } from '../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interface/pagination.type';
import prisma from '../../utils/prisma';

const createEvent = async (payLoad: any, fileUrl: any, hostId: string) => {
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
};

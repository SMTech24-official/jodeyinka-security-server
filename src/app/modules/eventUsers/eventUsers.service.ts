import { paginationHelpers } from '../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interface/pagination.type';
import prisma from '../../utils/prisma';

const registerUserToEvent = async (userId: string, eventId: string) => {
  const registeredEvent = await prisma.eventsUser.create({
    data: {
      userId,
      eventId,
    },
  });
  return registeredEvent;
};

const getRegisteredEvents = async (
  userId: string,
  paginationOptions: IPaginationOptions,
) => {
  const { limit, skip } =
    paginationHelpers.calculatePagination(paginationOptions);
  const events = await prisma.eventsUser.findMany({
    where: {
      userId,
    },
    select: {
      event: true,
    },
  });
  return events;
};

export const eventUsersServices = {
  registerUserToEvent,
  getRegisteredEvents,
};

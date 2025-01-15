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

export const eventUsersServices = {
  registerUserToEvent,
};

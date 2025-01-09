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

const getUpcomingEvents = async () => {
  const events = await prisma.event.findMany({
    where: {
      date: {
        gt: new Date(),
      },
    },
  });
  return events;
};
export const eventServices = {
  createEvent,
  getUpcomingEvents,
};

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

export const eventServices = {
  createEvent,
};

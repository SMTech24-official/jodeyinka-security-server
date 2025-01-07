import prisma from '../../utils/prisma';

const createEvent = async (payLoad: any, fileUrl: any, hostId: string) => {
  console.log(fileUrl);

  const event = await prisma.event.create({
    data: {
      ...payLoad,
      hostId: hostId,
      imageUrl: fileUrl,
    },
  });
  return;
};

export const eventServices = {
  createEvent,
};

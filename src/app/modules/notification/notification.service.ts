import prisma from '../../utils/prisma';

const getNotifications = async () => {
  const today = new Date();
  const day = today.getUTCDate();
  const month = today.getUTCMonth();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      dob: true,
      createdAt: true,
    },
  });
  const birthdayNotifications = users.filter(user => {
    const userDob = new Date(user.dob);
    const userDay = userDob.getUTCDate();
    const userMonth = userDob.getUTCMonth();
    return userDay === day && userMonth === month;
  });

  const memberAnniversaryNotifications = users.filter(user => {
    const userCat = new Date(user.createdAt);
    const userDay = userCat.getUTCDate();
    const userMonth = userCat.getUTCMonth();
    return userDay === day && userMonth === month;
  });
  return { birthdayNotifications, memberAnniversaryNotifications };
};

export const notificationServices = {
  getNotifications,
};

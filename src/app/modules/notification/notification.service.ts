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
  const birthdayNotifications = users.filter((user:any) => {
    const userDob = new Date(user?.dob);
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

const getMyNotification = async (id: string) => {
  return await prisma.notifications.findMany({
    where: { receiverId: id },
    include: {
      sender: true, 
      receiver: true, 
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const createNotification = async (payload:any) => {

  const notifications=  await prisma.notifications.create({data:payload})

  if(notifications?.id){
   
    return  await prisma.notifications.findFirst({where:{id:notifications.id},   include: {
      sender: true, 
      receiver: true, 
    }})


  }
  return
 
};

export const notificationServices = {
  getNotifications,
  createNotification,
  getMyNotification
};

import prisma from "../../utils/prisma";
import { getIOInstance } from "../../utils/socket";
import { firebasePushNotificationServices } from "../Firebase/firebasePushNotificationServices";



// Notification helper
const notifyUser = async (
  receiverId: string,
  data: {
    type: string;
    message: string;
    entityId?: string;
    entityType?: string;
    senderId?: string;
  }
) => {
  // 1️⃣ Save in DB
  const notification = await prisma.notifications.create({
    data: {
      receiverId,
      senderId: data.senderId,
      type: data.type,
      message: data.message,
      entityId: data.entityId,
      entityType: data.entityType,
    },
  });

  // 2️⃣ Send via Socket.IO
  const io = getIOInstance();
  io.to(receiverId).emit("new_notification", notification);

  // 3️⃣ Send Push Notification (FCM)
  const user = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { fcmToken: true },
  });

  if (user?.fcmToken) {
    try {
      await firebasePushNotificationServices.sendSinglePushNotification({
        body: {
          title: data.type, // Notification type কে Title হিসেবে পাঠাচ্ছি
          body: data.message, // আসল মেসেজ
        },
        fcmToken: user.fcmToken,
      });
    } catch (err) {
      console.error("❌ Push notification failed:", err);
    }
  }

  return notification;
};

export { notifyUser };

// Create group
const createGroup = async (creatorId: string, name: string, description?: string) => {
  const group = await prisma.group.create({
    data: {
      name,
      description,
      creatorId,
      members: {
        create: {
          userId: creatorId,
          role: "ADMIN",
          status: "ACCEPTED",
        },
      },
    },
    include: { members: { include: { user: true } } },
  });

  await notifyUser(creatorId, {
    type: "GROUP_CREATED",
    message: `You created the group "${group.name}"`,
    entityId: group.id,
    entityType: "GROUP",
  });

  return group;
};

// Invite member
const inviteMember = async (groupId: string, userId: string) => {
  // Check if already invited or member
  const existingInvite = await prisma.groupMember.findFirst({
    where: { groupId, userId },
  });
  if (existingInvite) throw new Error("User already invited or member of this group.");

  const group = await prisma.group.findUnique({ where: { id: groupId }, include: { creator: true } });

  const invite = await prisma.groupMember.create({
    data: { groupId, userId, status: "PENDING", role: "MEMBER" },
  });

  await notifyUser(userId, {
    type: "GROUP_INVITE",
    message: `You have been invited to group "${group?.name}" by ${group?.creator.firstName || group?.creator.lastName || group?.creator.userFullName}`,
    entityId: groupId,
    entityType: "GROUP",
    senderId: group?.creator.id,
  });

  return invite;
};

// Accept invite
const acceptInvite = async (groupId: string, userId: string) => {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  const updated = await prisma.groupMember.update({
    where: { groupId_userId: { groupId, userId } },
    data: { status: "ACCEPTED", joinedAt: new Date() },
  });

  const admins = await prisma.groupMember.findMany({
    where: { groupId, role: "ADMIN" },
    select: { userId: true },
  });

  for (const admin of admins) {
    await notifyUser(admin.userId, {
      type: "INVITE_ACCEPTED",
      message: `${user?.firstName || user?.lastName || user?.userFullName} has accepted the group invite`,
      entityId: groupId,
      entityType: "GROUP",
      senderId: userId,
    });
  }

  return updated;
};

// Reject invite
const rejectInvite = async (groupId: string, userId: string) => {
  const user = await prisma.user.findFirst({ where: { id: userId } });
      const updated = await prisma.groupMember.update({
    where: { groupId_userId: { groupId, userId } },
    data: { status: "REJECTED", joinedAt: new Date() },
  });
  const deleted = await prisma.groupMember.delete({ where: { groupId_userId: { groupId, userId } } });



  const admins = await prisma.groupMember.findMany({
    where: { groupId, role: "ADMIN" },
    select: { userId: true },
  });

  for (const admin of admins) {
    await notifyUser(admin.userId, {
      type: "INVITE_REJECTED",
      message: `${user?.firstName || user?.lastName || user?.userFullName} has rejected the group invite`,
      entityId: groupId,
      entityType: "GROUP",
      senderId: userId,
    });
  }

  return deleted;
};

// Get my groups
const getMyGroups = async (userId: string) => {
  return prisma.group.findMany({
    where: { members: { some: { userId, status: "ACCEPTED" } } },
    include: { members: { include: { user: true } } },
  });
};

// Send group message
const sendGroupMessage = async (groupId: string, senderId: string|any, content: string) => {
  const message = await prisma.groupMessage.create({
    data: { groupId, senderId, content },
    include: { sender: true },
  });

  const members = await prisma.groupMember.findMany({
    where: { groupId, status: "ACCEPTED", userId: { not: senderId } },
    select: { userId: true },
  });

  for (const member of members) {
    await notifyUser(member.userId, {
      type: "GROUP_MESSAGE",
      message: `${message.sender.firstName || message.sender.lastName || message.sender.userFullName} sent a new message`,
      entityId: message.id,
      entityType: "MESSAGE",
      senderId,
    });
  }

  return message;
};

// Get group messages
const getGroupMessages = async (groupId: string) => {
  return prisma.groupMessage.findMany({
    where: { groupId },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });
};


// Get group messages
const getAllMesagess = async (groupId: string) => {
  return prisma.groupMessage.findMany({
    where: { groupId },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });
};

// Get all notifications for a user
const getAllNotifications = async (userId: string) => {
  return prisma.notifications.findMany({
    where: { receiverId: userId },
    orderBy: { createdAt: "desc" }, // নতুন থেকে পুরনো
  });
};

// User leaves group
const leaveGroup = async (groupId: string, userId: string) => {
  const member = await prisma.groupMember.findFirst({
    where: { groupId, userId }
  });
  if (!member) throw new Error("You are not a member of this group.");

  const deleted = await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId } }
  });

  await notifyUser(userId, {
    type: "LEFT_GROUP",
    message: `You have left the group.`,
    entityId: groupId,
    entityType: "GROUP"
  });

  return deleted;
};

// Admin removes/kicks user
const kickUser = async (groupId: string, adminId: string, userId: string) => {
  const adminMember = await prisma.groupMember.findFirst({
    where: { groupId, userId: adminId, role: "ADMIN" }
  });
  if (!adminMember) throw new Error("Only admin can remove members.");

  const member = await prisma.groupMember.findFirst({
    where: { groupId, userId }
  });
  if (!member) throw new Error("User is not a member.");

  const deleted = await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId } }
  });

  // Notify the removed user
  await notifyUser(userId, {
    type: "KICKED",
    message: `You have been removed from the group by admin.`,
    entityId: groupId,
    entityType: "GROUP",
    senderId: adminId
  });

  return deleted;
};


export const GroupService = {
  createGroup,
  inviteMember,
  acceptInvite,
  rejectInvite,
  getMyGroups,
  sendGroupMessage,
  getGroupMessages,
  getAllNotifications,
  kickUser,
  leaveGroup,
  getAllMesagess
};

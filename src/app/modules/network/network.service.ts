// import httpStatus from "http-status";
// import AppError from "../../errors/AppError";
// import prisma from "../../utils/prisma";
// import { connectedUsers } from "../socket/socketHandler";

// import { Server as IOServer } from "socket.io";


// // ==================== Group System ====================

// // Create a new group
// // const createGroup = async (data: { name: string; description?: string; creatorId: string }) => {
// //   const group = await prisma.group.create({
// //     data: {
// //       name: data.name,
// //       description: data.description,
// //       creatorId: data.creatorId,
// //       members: {
// //         create: {
// //           userId: data.creatorId,
// //           role: "ADMIN",   // creator always admin
// //           status: "accepted",
// //         },
// //       },
// //     },
// //     include: { members: true },
// //   });
// //   return group;
// // };

// // // Add member to group (invite)
// // const addMember = async (groupId: string, userId: string) => {
// //   // check if member already exists
// //   const existing = await prisma.groupMember.findUnique({
// //     where: { groupId_userId: { groupId, userId } },
// //   });
// //   if (existing) throw new Error("User is already in the group or invited.");

// //   const member = await prisma.groupMember.create({
// //     data: {
// //       groupId,
// //       userId,
// //       role: "MEMBER",
// //       status: "pending", // invitation pending
// //     },
// //   });
// //   return member;
// // };

// // // Accept group invitation
// // const acceptInvitation = async (memberId: string) => {
// //   const updated = await prisma.groupMember.update({
// //     where: { id: memberId },
// //     data: { status: "accepted" },
// //   });
// //   return updated;
// // };

// // // Get all groups for a user
// // const getMyGroups = async (userId: string) => {
// //   const memberships = await prisma.groupMember.findMany({
// //     where: { userId, status: "accepted" },
// //     include: { group: true },
// //   });
// //   return memberships.map((m) => m.group);
// // };

// // ==================== Friend / Connection System ====================

// // Send friend request
// const sendRequest = async (
//   senderId: string,
//   receiverId: string,
//   io?: IOServer
// ) => {
//   const request = await prisma.friendRequest.create({
//     data: { senderId, receiverId },
//   });

//   const sender=await prisma.user.findFirst({
//     where:{id:senderId}
//   })

// const notification = await prisma.notifications.create({
//   data: {
//     receiverId,
//     senderId,
//     title: "New Friend Request",
//     message: `You have received a friend request from ${
//       sender?.firstName && sender?.lastName
//         ? `${sender.firstName} ${sender.lastName}`
//         : sender?.userFullName ?? "Unknown User"
//     }.`,
//     type: "FRIEND_REQUEST",
//     entityId: request.id,
//     entityType: "FRIEND_REQUEST",
//   },
// });

//   // Socket.IO emit
//   if (io) {
//     const socketId = connectedUsers.get(receiverId);
//     if (socketId) {
//       // 👇 cast io to proper type
//       (io as IOServer).to(socketId).emit("new_notification", notification);
//     }
//   }

//   return request;
// };

// // Respond to Friend Request (accept/reject)


// const respondRequest = async (
//   requestId: string,
//   status: "accepted" | "rejected",
//   io?: IOServer // <-- এখানে পরিবর্তন
// ) => {
//   // 1️⃣ Find the request first
//   const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
//   if (!request) throw new AppError(httpStatus.NOT_FOUND, "Friend request not found");

//   // 2️⃣ Update request status
//   const updatedRequest = await prisma.friendRequest.update({
//     where: { id: requestId },
//     data: { status },
//   });

//   // 3️⃣ Create notification to sender
//   const notification = await prisma.notifications.create({
//     data: {
//       receiverId: request.senderId,
//       senderId: request.receiverId,
//       title: `Friend Request ${status}`,
//       message: `Your friend request has been ${status} by the .`,
//       type: "FRIEND_REQUEST_RESPONSE",
//       entityId: request.id,
//       entityType: "FRIEND_REQUEST",
//     },
//   });

//   // 4️⃣ Emit notification via Socket.IO
//   if (io) {
//     const socketId = connectedUsers.get(request.senderId);
//     if (socketId) io.to(socketId).emit("new_notification", notification); // এখন TypeScript error নেই
//   }

//   return updatedRequest;
// };

// // Get all accepted connections for a user
// const getMyConnections = async (userId: string) => {
//   const acceptedRequests: any = await prisma.friendRequest.findMany({
//     where: {
//       OR: [
//         { senderId: userId, status: "accepted" },
//         { receiverId: userId, status: "accepted" },
//       ],
//     },
//     include: { sender: true, receiver: true },
//   });

//   return acceptedRequests.map((req: any) => {
//     // decide which user is the "other" user
//     const otherUser = req.senderId === userId ? { ...req.receiver } : { ...req.sender };

//     // remove password field
//     delete otherUser.password;

//     return otherUser;
//   });
// };


// const getReceivedRequests = async (userId: string) => {
//   const requests = await prisma.friendRequest.findMany({
//     where: { receiverId: userId, status: "pending" },
//     include: { sender: true }, // sender info লাগবে
//   });

//   return requests.map(req => ({
//     requestId: req.id,
//     senderId: req.senderId,
//     senderName: req.sender.userFullName ?? `${req.sender.firstName} ${req.sender.lastName}`,
//     senderAvatar: req.sender.avatarUrl ?? null,
//     status: req.status,
//     createdAt: req.createdAt,
//   }));
// };


// const getSentRequests = async (userId: string) => {
//   const requests = await prisma.friendRequest.findMany({
//     where: { senderId: userId, status: "pending" },
//     include: { receiver: true }, // receiver info লাগবে
//   });

//   return requests.map(req => ({
//     requestId: req.id,
//     receiverId: req.receiverId,
//     receiverName: req.receiver.userFullName ?? `${req.receiver.firstName} ${req.receiver.lastName}`,
//     receiverAvatar: req.receiver.avatarUrl ?? null,
//     status: req.status,
//     createdAt: req.createdAt,
//   }));
// };


// // ==================== Export ====================
// export const networkService = {
//   // Group system
//   // createGroup,
//   // addMember,
//   // acceptInvitation,
//   // getMyGroups,

//   // Friend system
//   sendRequest,
//   respondRequest,
//   getMyConnections,
//   getReceivedRequests,
//   getSentRequests
// };





// network.service.ts
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import prisma from "../../utils/prisma";
import { connectedUsers } from "../socket/socketHandler";
import { Server as IOServer } from "socket.io";
import { firebasePushNotificationServices } from "../Firebase/firebasePushNotificationServices";


// ---------------- Notification Helper ----------------
const notifyUserWithSocketAndPush = async (receiverId: string, notification: any, io?: IOServer) => {
  // 1️⃣ Save to DB
  await prisma.notifications.create({ data: notification });

  // 2️⃣ Socket.IO
  if (io) {
    const socketId = connectedUsers.get(receiverId);
    if (socketId) io.to(socketId).emit('new_notification', notification);
  }

  // 3️⃣ Push Notification
  const user = await prisma.user.findUnique({ where: { id: receiverId } });
  if (user?.fcmToken) {
    await firebasePushNotificationServices.sendSinglePushNotification({
      fcmToken: user.fcmToken,
      body: { title: notification.title, body: notification.message },
    });
  }
};

// ---------------- Friend Request System ----------------

// Send friend request
const sendRequest = async (senderId: string, receiverId: string, io?: IOServer) => {
  const request = await prisma.friendRequest.create({ data: { senderId, receiverId } });

  const sender = await prisma.user.findUnique({ where: { id: senderId } });

  const notification = {
    receiverId,
    senderId,
    title: "New Friend Request",
    message: `You have received a friend request from ${
      sender?.firstName && sender?.lastName
        ? `${sender.firstName} ${sender.lastName}`
        : sender?.userFullName ?? "Unknown User"
    }.`,
    type: "FRIEND_REQUEST",
    entityId: request.id,
    entityType: "FRIEND_REQUEST",
  };

  await notifyUserWithSocketAndPush(receiverId, notification, io);

  return request;
};

// Respond to Friend Request (accept/reject)
const respondRequest = async (requestId: string, status: "accepted" | "rejected", io?: IOServer) => {
  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError(httpStatus.NOT_FOUND, "Friend request not found");

  const updatedRequest = await prisma.friendRequest.update({ where: { id: requestId }, data: { status } });

  const notification = {
    receiverId: request.senderId,
    senderId: request.receiverId,
    title: `Friend Request ${status}`,
    message: `Your friend request has been ${status} by the user.`,
    type: "FRIEND_REQUEST_RESPONSE",
    entityId: request.id,
    entityType: "FRIEND_REQUEST",
  };

  await notifyUserWithSocketAndPush(request.senderId, notification, io);

  return updatedRequest;
};

// Get all accepted connections for a user
const getMyConnections = async (userId: string) => {
  const acceptedRequests = await prisma.friendRequest.findMany({
    where: {
      OR: [
        { senderId: userId, status: "accepted" },
        { receiverId: userId, status: "accepted" },
      ],
    },
    include: { sender: true, receiver: true },
  });

  return acceptedRequests.map(req => {
    const otherUser:any = req.senderId === userId ? { ...req.receiver } : { ...req.sender };
    delete otherUser.password;
    return otherUser;
  });
};

// Get all received friend requests
const getReceivedRequests = async (userId: string) => {
  const requests = await prisma.friendRequest.findMany({
    where: { receiverId: userId, status: "pending" },
    include: { sender: true },
  });

  return requests.map(req => ({
    requestId: req.id,
    senderId: req.senderId,
    senderName: req.sender.userFullName ?? `${req.sender.firstName} ${req.sender.lastName}`,
    senderAvatar: req.sender.avatarUrl ?? null,
    status: req.status,
    createdAt: req.createdAt,
  }));
};

// Get all sent friend requests
const getSentRequests = async (userId: string) => {
  const requests = await prisma.friendRequest.findMany({
    where: { senderId: userId, status: "pending" },
    include: { receiver: true },
  });

  return requests.map(req => ({
    requestId: req.id,
    receiverId: req.receiverId,
    receiverName: req.receiver.userFullName ?? `${req.receiver.firstName} ${req.receiver.lastName}`,
    receiverAvatar: req.receiver.avatarUrl ?? null,
    status: req.status,
    createdAt: req.createdAt,
  }));
};

// ==================== Export ====================
export const networkService = {
  sendRequest,
  respondRequest,
  getMyConnections,
  getReceivedRequests,
  getSentRequests
};

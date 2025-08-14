




import { Server } from 'socket.io';
import prisma from '../../utils/prisma';
import { generateRoomId } from '../../utils/generateRoomId';


const createMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  io: Server,
 
  connectedUsers: Map<string, string> ,
   roomId:string,
) => {
  console.log(`[MessagingService - createMessage] Attempting to create message from ${senderId} to ${receiverId}.`);
  // 1. Create the message record in the database
  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      content,
      roomId
    },
  });
  console.log(`[MessagingService - createMessage] Message saved to DB with ID: ${message.id}`);

  // 2. Create a notification record for the receiver in the database
  await prisma.notifications.create({
    data: {
      senderId,
      receiverId,
      message: content,
      title: 'New Message',
      type: 'message',
   
    },
  });
  console.log(`[MessagingService - createMessage] Notification saved to DB for receiver: ${receiverId}`);

  // 3. Fetch the newly created message with full sender/receiver details for real-time delivery
  const newMessageWithDetails = await prisma.message.findFirst({
    where: { id: message.id },
    include: {
      receiver: { select: { firstName: true, lastName: true, id: true, image: true, email: true, isOnline: true, lastSeen: true } },
      sender: { select: { firstName: true, lastName: true, id: true, image: true, email: true, isOnline: true, lastSeen: true } },
    },
  });
  console.log(`[MessagingService - createMessage] Fetched new message details for real-time delivery.`);

  if (newMessageWithDetails) {
    // Determine the unique 1-to-1 room ID for this conversation (though not directly used for emitting 'new_message' here)
    const roomId = generateRoomId(senderId, receiverId);
    console.log(`[MessagingService - createMessage] Generated Room ID for conversation: ${roomId}`);
    
    // Send the new message to the receiver's specific socket (if online)
    const receiverSocketId = connectedUsers.get(receiverId);
    console.log(`[MessagingService - createMessage] Receiver ${receiverId} socket ID from map: ${receiverSocketId}`);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_message', newMessageWithDetails); 
      console.log(`[MessagingService - createMessage] Emitted 'new_message' to receiver ${receiverId} (Socket ID: ${receiverSocketId}).`);
    } else {
      console.log(`[MessagingService - createMessage] Receiver ${receiverId} is OFFLINE. Message will be fetched from DB when they come online.`);
    }

    // Send a separate real-time notification to the receiver (if online).
    if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_notification', {
            senderId: newMessageWithDetails.senderId,
            receiverId: newMessageWithDetails.receiverId,
            message: newMessageWithDetails.content,
            title: 'New Message',
            type: 'message',
            createdAt: newMessageWithDetails.createdAt,
        });
        console.log(`[MessagingService - createMessage] Emitted 'new_notification' to online receiver ${receiverId} (Socket ID: ${receiverSocketId}).`);
    } else {
        console.log(`[MessagingService - createMessage] Receiver ${receiverId} is offline, notification will remain in DB.`);
    }

    return newMessageWithDetails;
  }

  console.error(`[MessagingService - createMessage ERROR] Failed to retrieve new message after creation for sender ${senderId}, receiver ${receiverId}.`);
  throw new Error('Failed to retrieve new message after creation.');
};

const getMyMessages = async (userId1: string, userId2: string) => {
  console.log(`[MessagingService - getMyMessages] Fetching messages between ${userId1} and ${userId2}.`);
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
    include: {
      receiver: { select: { firstName: true, lastName: true, id: true, image: true, email: true, isOnline: true, lastSeen: true } },
      sender: { select: { firstName: true, lastName: true, id: true, image: true, email: true, isOnline: true, lastSeen: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`[MessagingService - getMyMessages] Found ${messages.length} messages between ${userId1} and ${userId2}.`);
  return messages;
};



// const getMyChatList = async (userId: string, searchParams?: string) => {
//   console.log(`[MessagingService - getMyChatList] Fetching chat list for User ID: ${userId}.`);

//   const whereCondition: any = {
//     OR: [{ senderId: userId }, { receiverId: userId }],
//   };

//   if (searchParams) {
//     whereCondition.AND = [
//       {
//         OR: [
//           {
//             receiver: {
//               OR: [
//                 { firstName: { contains: searchParams, mode: 'insensitive' } },
//                 { lastName: { contains: searchParams, mode: 'insensitive' } },
//                 { userFullName: { contains: searchParams, mode: 'insensitive' } },
//               ],
//             },
//           },
//           {
//             sender: {
//               OR: [
//                 { firstName: { contains: searchParams, mode: 'insensitive' } },
//                 { lastName: { contains: searchParams, mode: 'insensitive' } },
//                 { userFullName: { contains: searchParams, mode: 'insensitive' } },
//               ],
//             },
//           },
//         ],
//       },
//     ];
//   }

//   const messages = await prisma.message.findMany({
//     where: whereCondition,
//     orderBy: { createdAt: 'desc' },
//     include: {
//       sender: {
//         select: {
//           firstName: true,
//           lastName: true,
//           userFullName: true,
//           id: true,
//           image: true,
//           email: true,
//           isOnline: true,
//           lastSeen: true,
//         },
//       },
//       receiver: {
//         select: {
//           firstName: true,
//           lastName: true,
//           userFullName: true,
//           id: true,
//           image: true,
//           email: true,
//           isOnline: true,
//           lastSeen: true,
//         },
//       },
//     },
//   });

//   console.log(`[MessagingService - getMyChatList] Fetched ${messages.length} messages for chat list processing.`);

//   const chatMap = new Map<string, any>();

//   for (const msg of messages) {
//     const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
//     if (!chatMap.has(otherUser.id)) {
//       chatMap.set(otherUser.id, {
//         user: {
//           id: otherUser.id,
//           firstName: otherUser.firstName,
//           lastName: otherUser.lastName,
//           email: otherUser.email,
//           image: otherUser.image,
//           isOnline: otherUser.isOnline,
//           lastSeen: otherUser.lastSeen,
//         },
//         lastMessage: msg,
//       });
//     }
//   }

//   const chatList = Array.from(chatMap.values());
//   console.log(`[MessagingService - getMyChatList] Generated chat list with ${chatList.length} unique chats.`);

//   return chatList;
// };


const getMyChatList = async (userId: string, searchParams?: any) => {
  console.log(`[MessagingService - getMyChatList] Fetching chat list for User ID: ${userId}.`);

  const whereCondition: any = {
    OR: [{ senderId: userId }, { receiverId: userId }],
  };

  if (searchParams) {
    whereCondition.AND = [
      {
        OR: [
          {
            receiver: {
              OR: [
                { firstName: { contains: searchParams, mode: 'insensitive' } },
                { lastName: { contains: searchParams, mode: 'insensitive' } },
                { userFullName: { contains: searchParams, mode: 'insensitive' } },
              ],
            },
          },
          {
            sender: {
              OR: [
                { firstName: { contains: searchParams, mode: 'insensitive' } },
                { lastName: { contains: searchParams, mode: 'insensitive' } },
                { userFullName: { contains: searchParams, mode: 'insensitive' } },
              ],
            },
          },
        ],
      },
    ];
  }

  const messages = await prisma.message.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
    include: {
      sender: {
        select: {
          firstName: true,
          lastName: true,
          userFullName: true,
          id: true,
          image: true,
          email: true,
          isOnline: true,
          lastSeen: true,
        },
      },
      receiver: {
        select: {
          firstName: true,
          lastName: true,
          userFullName: true,
          id: true,
          image: true,
          email: true,
          isOnline: true,
          lastSeen: true,
        },
      },
    },
  });

  console.log(`[MessagingService - getMyChatList] Fetched ${messages.length} messages for chat list processing.`);

  const chatMap = new Map<string, any>();

  for (const msg of messages) {
    const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;

    if (!chatMap.has(otherUser.id)) {
      // Unseen message count (যেখানে আমি receiver আর seen = false)
      const unseenCount = await prisma.message.count({
        where: {
          senderId: otherUser.id,
          receiverId: userId,
          seen: false,
        },
      });

      chatMap.set(otherUser.id, {
        user: {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          email: otherUser.email,
          image: otherUser.image,
          isOnline: otherUser.isOnline,
          lastSeen: otherUser.lastSeen,
        },
        lastMessage: msg,
        unseenMessageCount: unseenCount,
      });
    }
  }

  const chatList = Array.from(chatMap.values());
  console.log(`[MessagingService - getMyChatList] Generated chat list with ${chatList.length} unique chats.`);

  return chatList;
};


const getMyNotifications = async (userId: string) => {
  console.log(`[MessagingService - getMyNotifications] Fetching notifications for User ID: ${userId}.`);
  const notifications = prisma.notifications.findMany({
    where: { receiverId: userId },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`[MessagingService - getMyNotifications] Found ${notifications} notifications for User ID: ${userId}.`);
  return notifications;
};

const getMessagesBetweenUsers = async (userId1: string, userId2: string) => {
  console.log(`[MessagingService - getMessagesBetweenUsers] Fetching messages between ${userId1} and ${userId2}.`);
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      senderId: true,
      receiverId: true,
      createdAt: true,
      seen: true,
      seenAt: true,
    },
  });
  console.log(`[MessagingService - getMessagesBetweenUsers] Found ${messages.length} messages between ${userId1} and ${userId2}.`);
  return messages;
};

export const MessagingSystemService = {
  createMessage,
  getMyMessages,
  getMyChatList,
  getMyNotifications,
  getMessagesBetweenUsers,
};
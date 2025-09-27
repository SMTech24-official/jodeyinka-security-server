



// import { Server, Socket } from 'socket.io';
// import jwt from 'jsonwebtoken';
// import prisma from '../../utils/prisma';
// import config from '../../../config';
// import { MessagingSystemService } from '../MessagingSystem/messagingSystem.service';
// import { generateRoomId } from '../../utils/generateRoomId';

// const connectedUsers = new Map<string, string>(); // userId -> socketId

// export const handleSocketEvents = (io: Server, socket: Socket) => {
//   let currentUserId: string | null = null;

//   // --- User Authentication and Presence ---
//   socket.on('authenticate', async (token: string) => {
//     try {
//       if (!token) {
//         socket.emit('auth_error', { message: 'Authentication token missing.' });
//         return;
//       }

//       const decoded: any = jwt.verify(token, config.jwt.access_secret as string);
//       currentUserId = decoded.id as string;

//       // Optional: Handle multiple connections per user if needed
//       if (connectedUsers.has(currentUserId) && connectedUsers.get(currentUserId) !== socket.id) {
//         console.log(`User ${currentUserId} connected from new socket. Old socket ${connectedUsers.get(currentUserId)} will be replaced.`);
//       }
      
//       connectedUsers.set(currentUserId, socket.id); // Store or update the user's current socket ID

//       await prisma.user.update({
//         where: { id: currentUserId },
//         data: { isOnline: true },
//       });

//       // Notify all connected clients that this user is online
//       io.emit('user_online', currentUserId); 
//       console.log(`User ${currentUserId} is online (Socket ID: ${socket.id})`);

//       // Send chat list immediately after authentication
//       const chatList = await MessagingSystemService.getMyChatList(currentUserId);
//       socket.emit('chat-list', chatList);

//     } catch (err) {
//       console.error('Authentication failed:', err);
//       // Send a more user-friendly error message
//       socket.emit('auth_error', { message: 'Authentication failed. Please log in again.' });
//     }
//   });

//   socket.on('disconnect', async () => {
//     if (currentUserId) {
//       // Only set user offline if this was their last active socket
//       if (connectedUsers.get(currentUserId) === socket.id) {
//         connectedUsers.delete(currentUserId);

//         await prisma.user.update({
//           where: { id: currentUserId },
//           data: {
//             isOnline: false,
//             lastSeen: new Date(),
//           },
//         });
//         io.emit('user_offline', currentUserId); // Notify others
//         console.log(`User ${currentUserId} went offline (Socket ID: ${socket.id})`);
//       } else {
//         console.log(`Socket ${socket.id} disconnected for user ${currentUserId}, but another socket is still active.`);
//       }
//     }
//   });

//   // --- Messaging Events ---

//   // Send Message
//   socket.on('send_message', async ({ senderId, receiverId, content }) => {
//     try {
//       // Basic validation
//       if (!senderId || !receiverId || !content) {
//         socket.emit('message_send_error', { message: 'Missing senderId, receiverId, or content.' });
//         return;
//       }
//       // Ensure sender is the authenticated user (important for security)
//       if (currentUserId !== senderId) {
//         socket.emit('message_send_error', { message: 'Unauthorized message send attempt.' });
//         return;
//       }

//       // Now createMessage expects only senderId, receiverId, content, io, connectedUsers
//       const createdMessage = await MessagingSystemService.createMessage(senderId, receiverId, content, io, connectedUsers);
//       // Optionally, confirm message sent to the sender
//       socket.emit('message_sent_success', createdMessage);

//     } catch (error) {
//       console.error('Error sending message:', error);
//       socket.emit('message_send_error', { message: 'Failed to send message.' });
//     }
//   });

//   // Get Chat List
//   socket.on('get-chat-list', async (token: string) => {
//     try {
//       if (!token) {
//         socket.emit('chat_list_error', { message: 'Token missing for chat list.' });
//         return;
//       }

//       const decoded: any = jwt.verify(token, config.jwt.access_secret as string);
//       const userId = decoded.id; // Get user ID from the token, don't query DB if not needed
      
//       if (currentUserId !== userId) { // Security check
//         socket.emit('chat_list_error', { message: 'Unauthorized chat list request.' });
//         return;
//       }

//       const chatList = await MessagingSystemService.getMyChatList(userId);
//       socket.emit('chat-list', chatList);
//     } catch (error) {
//       console.error('Error fetching chat list:', error);
//       socket.emit('chat_list_error', { message: 'Unauthorized or error fetching chat list.' });
//     }
//   });

//   // Join Room (specific to 1-to-1 chat rooms)
//   socket.on('join_room', ({ userId1, userId2 }) => {
//     // Basic validation
//     if (!userId1 || !userId2) {
//       socket.emit('room_join_error', { message: 'Missing userId1 or userId2 for joining room.' });
//       return;
//     }
//     // Ensure one of the users is the authenticated user
//     if (currentUserId !== userId1 && currentUserId !== userId2) {
//         socket.emit('room_join_error', { message: 'Unauthorized room join attempt.' });
//         return;
//     }

//     const roomId = generateRoomId(userId1, userId2);
//     socket.join(roomId);
//     console.log(`Socket ${socket.id} joined room ${roomId}`);
//     socket.emit('room_joined', { roomId, message: `Joined room ${roomId}` });
//   });

//   // Leave Room (specific to 1-to-1 chat rooms)
//   socket.on('leave_room', ({ userId1, userId2 }) => {
//     // Basic validation
//     if (!userId1 || !userId2) {
//       socket.emit('room_leave_error', { message: 'Missing userId1 or userId2 for leaving room.' });
//       return;
//     }
//      // Ensure one of the users is the authenticated user
//      if (currentUserId !== userId1 && currentUserId !== userId2) {
//         socket.emit('room_leave_error', { message: 'Unauthorized room leave attempt.' });
//         return;
//     }

//     const roomId = generateRoomId(userId1, userId2);
//     socket.leave(roomId);
//     console.log(`Socket ${socket.id} left room ${roomId}`);
//     socket.emit('room_left', { roomId, message: `Left room ${roomId}` });
//   });

//   // Mark Message as Seen
//   socket.on('mark-as-seen', async ({ senderId, receiverId }) => {
//     try {
//       if (!senderId || !receiverId) {
//         socket.emit('mark_seen_error', { message: 'Missing senderId or receiverId to mark as seen.' });
//         return;
//       }
//       // Security check: Ensure the receiver is the authenticated user
//       if (currentUserId !== receiverId) {
//           socket.emit('mark_seen_error', { message: 'Unauthorized attempt to mark messages as seen.' });
//           return;
//       }

//       await prisma.message.updateMany({
//         where: {
//           senderId,
//           receiverId, // Messages where current user is the receiver
//           seen: false,
//         },
//         data: {
//           seen: true,
//           seenAt: new Date(),
//         },
//       });

//       // Notify both parties in the room that messages have been seen
//       const roomId = generateRoomId(senderId, receiverId);
//       io.to(roomId).emit('messages-seen', { senderId, receiverId, seenBy: receiverId });
//       socket.emit('mark_seen_success', { senderId, receiverId });

//     } catch (error) {
//       console.error('Error marking messages as seen:', error);
//       socket.emit('mark_seen_error', { message: 'Failed to mark messages as seen.' });
//     }
//   });
// };






import { Server, Socket } from 'socket.io';
import jwt, { Secret } from 'jsonwebtoken';
import prisma from '../../utils/prisma';
import config from '../../../config';

import { generateRoomId } from '../../utils/generateRoomId';
import { verifyToken } from '../../utils/verifyToken';
import { MessagingSystemService } from '../messagingSystem/messagingSystem.service';

 export const connectedUsers = new Map<string, string>(); 

export const handleSocketEvents = (io: Server, socket: Socket) => {
  let currentUserId: string | null = null; 

  console.log(`[Socket.IO] New connection. Socket ID: ${socket.id}`);

  // --- User Authentication and Presence ---
  socket.on('authenticate', async (token: string) => {
    console.log(`[Socket.IO - Authenticate] Received authentication attempt from Socket ID: ${socket.id}`);
    try {
      if (!token) {
        console.warn(`[Socket.IO - Authenticate] Token missing for Socket ID: ${socket.id}`);
        socket.emit('auth_error', { message: 'Authentication token missing.' });
        return;
      }

      
      
      const decoded: any = verifyToken(
              token,
              config.jwt.access_secret as Secret,
            );
      currentUserId = decoded.id as string;
      console.log(`[Socket.IO - Authenticate] Token decoded for User ID: ${currentUserId}`);
      
      if (connectedUsers.has(currentUserId) && connectedUsers.get(currentUserId) !== socket.id) {
        console.log(`[Socket.IO - Authenticate] User ${currentUserId} already has an active socket (${connectedUsers.get(currentUserId)}). Replacing with new Socket ID: ${socket.id}`);
        // Optionally, disconnect old socket here if you want single active session
        // io.sockets.sockets.get(connectedUsers.get(currentUserId) as string)?.disconnect(true);
      }
      
      connectedUsers.set(currentUserId, socket.id); 
      console.log(`[Socket.IO - Authenticate] User ${currentUserId} mapped to Socket ID: ${socket.id}`);

      await prisma.user.update({
        where: { id: currentUserId },
        data: { isOnline: true },
      });
      console.log(`[Socket.IO - Authenticate] User ${currentUserId} online status updated in DB.`);

      io.emit('user_online', currentUserId); 
      console.log(`[Socket.IO - Authenticate] Emitting 'user_online' for User ID: ${currentUserId}`);

      const chatList = await MessagingSystemService.getMyChatList(currentUserId);
      socket.emit('chat-list', chatList);
      console.log(`[Socket.IO - Authenticate] Emitted 'chat-list' for User ID: ${currentUserId}`);

    } catch (err) {
      console.error(`[Socket.IO - Authenticate ERROR] Authentication failed for Socket ID: ${socket.id}. Error:`, err);
      socket.emit('auth_error', { message: 'Authentication failed. Please log in again.' });
    }
  });

  // --- Handle User Disconnection ---
  socket.on('disconnect', async () => {
    console.log(`[Socket.IO - Disconnect] Socket ID ${socket.id} disconnected.`);
    if (currentUserId) {
      if (connectedUsers.get(currentUserId) === socket.id) {
        connectedUsers.delete(currentUserId); 
        console.log(`[Socket.IO - Disconnect] User ${currentUserId} removed from connectedUsers map.`);

        await prisma.user.update({
          where: { id: currentUserId },
          data: {
            isOnline: false,
            lastSeen: new Date(),
          },
        });
        console.log(`[Socket.IO - Disconnect] User ${currentUserId} offline status updated in DB.`);

        io.emit('user_offline', currentUserId); 
        console.log(`[Socket.IO - Disconnect] Emitting 'user_offline' for User ID: ${currentUserId}`);
      } else {
        console.log(`[Socket.IO - Disconnect] Socket ID ${socket.id} disconnected for user ${currentUserId}, but another socket is still active. Not marking offline.`);
      }
    } else {
      console.log(`[Socket.IO - Disconnect] Disconnected socket ${socket.id} was not authenticated.`);
    }
  });

  // --- Messaging Events ---

  // new message
  socket.on('send_message', async ({ senderId, receiverId, content, }) => {
    console.log(`[Socket.IO - send_message] Received message from ${senderId} to ${receiverId}. Content: "${content}"`);
    try {
      if (!senderId || !receiverId || !content) {
        console.warn(`[Socket.IO - send_message] Missing data from ${socket.id}. Sender: ${senderId}, Receiver: ${receiverId}, Content: ${content}`);
        socket.emit('message_send_error', { message: 'Missing senderId, receiverId, or content.' });
        return;
      }
      if (currentUserId !== senderId) {
        console.warn(`[Socket.IO - send_message] Unauthorized attempt! currentUserId: ${currentUserId}, senderId: ${senderId}.`);
        socket.emit('message_send_error', { message: 'Unauthorized message send attempt.' });
        return;
      }

 const roomId = generateRoomId(senderId, receiverId);
      const createdMessage = await MessagingSystemService.createMessage(senderId, receiverId, content, io, connectedUsers,roomId);
      
      socket.emit('new_message', createdMessage);
      const chatList = await MessagingSystemService.getMyChatList(senderId);

      console.log(chatList)
      socket.to(senderId).emit('chat-list', chatList);
      console.log(`[Socket.IO - send_message] Emitted 'message_sent_success' to sender ${senderId} (Socket ID: ${socket.id}).`);

    } catch (error) {
      console.error(`[Socket.IO - send_message ERROR] Error sending message from ${senderId}:`, error);
      socket.emit('message_send_error', { message: 'Failed to send message.' });
    }
  });

  

  // Handle fetching a user's chat list
  socket.on('get-chat-list', async (token: string) => {
    console.log(`[Socket.IO - get-chat-list] Received request from Socket ID: ${socket.id}`);
    try {
      if (!token) {
        console.warn(`[Socket.IO - get-chat-list] Token missing for Socket ID: ${socket.id}.`);
        socket.emit('chat_list_error', { message: 'Token missing for chat list.' });
        return;
      }

      const decoded: any = jwt.verify(token, config.jwt.access_secret as string);
      const userId = decoded.id; 
      console.log(`[Socket.IO - get-chat-list] Decoded token for User ID: ${userId}`);
      
      if (currentUserId !== userId) { 
        console.warn(`[Socket.IO - get-chat-list] Unauthorized attempt! currentUserId: ${currentUserId}, requested userId: ${userId}.`);
        socket.emit('chat_list_error', { message: 'Unauthorized chat list request.' });
        return;
      }

      const chatList = await MessagingSystemService.getMyChatList(userId);
      socket.emit('chat-list', chatList);
      console.log(`[Socket.IO - get-chat-list] Emitted 'chat-list' for User ID: ${userId}.`);
    } catch (error) {
      console.error(`[Socket.IO - get-chat-list ERROR] Error fetching chat list for Socket ID: ${socket.id}. Error:`, error);
      socket.emit('chat_list_error', { message: 'Unauthorized or error fetching chat list.' });
    }
  });

  // Handle joining a specific 1-to-1 chat room
  socket.on('join_room', ({ userId1, userId2 }) => {
    console.log(`[Socket.IO - join_room] Received request to join room from Socket ID: ${socket.id} for users ${userId1} and ${userId2}`);
    if (!userId1 || !userId2) {
      console.warn(`[Socket.IO - join_room] Missing userId1 or userId2. Socket ID: ${socket.id}`);
      socket.emit('room_join_error', { message: 'Missing userId1 or userId2 for joining room.' });
      return;
    }
    if (currentUserId !== userId1 && currentUserId !== userId2) {
        console.warn(`[Socket.IO - join_room] Unauthorized attempt! Current User: ${currentUserId}, Requested Users: ${userId1}, ${userId2}.`);
        socket.emit('room_join_error', { message: 'Unauthorized room join attempt.' });
        return;
    }

    const roomId = generateRoomId(userId1, userId2);
    socket.join(roomId); 
    console.log(`[Socket.IO - join_room] Socket ${socket.id} successfully joined room ${roomId}.`);
    socket.emit('room_joined', { roomId, message: `Joined room ${roomId}` });
  });

  // Handle leaving a specific 1-to-1 chat room
  socket.on('leave_room', ({ userId1, userId2 }) => {
    console.log(`[Socket.IO - leave_room] Received request to leave room from Socket ID: ${socket.id} for users ${userId1} and ${userId2}`);
    if (!userId1 || !userId2) {
      console.warn(`[Socket.IO - leave_room] Missing userId1 or userId2. Socket ID: ${socket.id}`);
      socket.emit('room_leave_error', { message: 'Missing userId1 or userId2 for leaving room.' });
      return;
    }
     if (currentUserId !== userId1 && currentUserId !== userId2) {
        console.warn(`[Socket.IO - leave_room] Unauthorized attempt! Current User: ${currentUserId}, Requested Users: ${userId1}, ${userId2}.`);
        socket.emit('room_leave_error', { message: 'Unauthorized room leave attempt.' });
        return;
    }

    const roomId = generateRoomId(userId1, userId2);
    socket.leave(roomId); 
    console.log(`[Socket.IO - leave_room] Socket ${socket.id} successfully left room ${roomId}.`);
    socket.emit('room_left', { roomId, message: `Left room ${roomId}` });
  });

  // Handle marking messages as seen
  socket.on('mark-as-seen', async ({ senderId, receiverId }) => {
    console.log(`[Socket.IO - mark-as-seen] Received request to mark messages from ${senderId} to ${receiverId} as seen.`);
    try {
      if (!senderId || !receiverId) {
        console.warn(`[Socket.IO - mark-as-seen] Missing senderId or receiverId.`);
        socket.emit('mark_seen_error', { message: 'Missing senderId or receiverId to mark as seen.' });
        return;
      }
      if (currentUserId !== receiverId) {
          console.warn(`[Socket.IO - mark-as-seen] Unauthorized attempt! Current User: ${currentUserId}, Receiver: ${receiverId}.`);
          socket.emit('mark_seen_error', { message: 'Unauthorized attempt to mark messages as seen.' });
          return;
      }

      await prisma.message.updateMany({
        where: {
          senderId,
          receiverId, 
          seen: false, 
        },
        data: {
          seen: true,
          seenAt: new Date(),
        },
      });
      console.log(`[Socket.IO - mark-as-seen] Messages from ${senderId} to ${receiverId} marked as seen in DB.`);

      const roomId = generateRoomId(senderId, receiverId);
      io.to(roomId).emit('messages-seen', { senderId, receiverId, seenBy: receiverId });
      console.log(`[Socket.IO - mark-as-seen] Emitted 'messages-seen' to room ${roomId}.`);
      socket.emit('mark_seen_success', { senderId, receiverId });
      console.log(`[Socket.IO - mark-as-seen] Emitted 'mark_seen_success' to receiver ${receiverId} (Socket ID: ${socket.id}).`);

    } catch (error) {
      console.error(`[Socket.IO - mark-as-seen ERROR] Error marking messages as seen for ${senderId} to ${receiverId}:`, error);
      socket.emit('mark_seen_error', { message: 'Failed to mark messages as seen.' });
    }
  });
};
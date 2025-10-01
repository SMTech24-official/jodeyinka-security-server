// // import httpStatus from 'http-status';
// // import AppError from '../../errors/AppError';
// // import prisma from '../../utils/prisma';

// // // ---------------- Post CRUD ----------------

// // const createPost = async (
// //   authorId: string,
// //   title: string,
// //   description: string,
// //   type: 'BLOG' | 'MEDIA',
// //   fileUrl?: string
// // ) => {
// //   // 1️⃣ Post তৈরি করা
// //   const post = await prisma.post.create({
// //     data: { title, description, type, authorId, fileUrl },
// //   });

// //   // 2️⃣ Admin এবং Superadmin users fetch করা
// //   const admins = await prisma.user.findMany({
// //     where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
// //     select: { id: true },
// //   });

// //   // 3️⃣ Notification create করা
// //   const notificationsData = admins.map(admin => ({
// //     receiverId: admin.id,
// //     senderId: authorId,
// //     title: 'New Post Created',
// //     message: `A new post titled "${title}" has been created by a user.`,
// //     type: 'POST',
// //     entityId: post.id,
// //     entityType: 'POST',
// //   }));

// //   if (notificationsData.length > 0) {
// //     await prisma.notifications.createMany({ data: notificationsData });
// //   }

// //   return post;
// // };



// // const updatePost = async (
// //   postId: string,
// //   authorId: string,
// //   data: { title?: string; description?: string; fileUrl?: string }
// // ) => {
// //   const post = await prisma.post.findUnique({ where: { id: postId } });
// //   if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");
// //   if (post.authorId !== authorId)
// //     throw new AppError(httpStatus.FORBIDDEN, "You cannot update this post");

// //   return prisma.post.update({ where: { id: postId }, data });
// // };



// // const approvePost = async (postId: string, status: 'APPROVED' | 'REJECTED') => {
// //   // 1️⃣ Post খুঁজে বের করা
// //   const post = await prisma.post.findUnique({ where: { id: postId } });
// //   if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");

// //   // 2️⃣ Post update করা
// //   const updatedPost = await prisma.post.update({
// //     where: { id: postId },
// //     data: { status },
// //   });

// //   // 3️⃣ Notification তৈরি করা
// //   await prisma.notifications.create({
// //     data: {
// //       receiverId: post.authorId, // post করা user
// //       senderId: null, // admin হলে null রাখতে পারো বা admin id দিতে পারো
// //       title: `Your post has been ${status.toLowerCase()}`,
// //       message: `Your post "${post.title}" has been ${status.toLowerCase()} by admin.`,
// //       type: 'POST',
// //       entityId: postId,
// //       entityType: 'POST',
// //     },
// //   });

// //   return updatedPost;
// // };

// // const deletePost = async (postId: string, authorId: string) => {
// //   const post = await prisma.post.findUnique({ where: { id: postId } });
// //   if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");
// //   if (post.authorId !== authorId)
// //     throw new AppError(httpStatus.FORBIDDEN, "You cannot delete this post");

// //   return prisma.post.delete({ where: { id: postId } });
// // };

// // const getPostById = async (postId: string) => {
// //   // 1️⃣ Post fetch + views increment transaction
// //   const [post] = await prisma.$transaction([
// //     prisma.post.update({
// //       where: { id: postId },
// //       data: { views: { increment: 1 } }, // views increment
// //       include: {
// //         Author: { select: { id: true, firstName: true, lastName: true, userName: true, avatarUrl: true } },
// //         PostComment: { include: { Author: { select: { id: true, userName: true, avatarUrl: true } } } },
// //         PostLike: { include: { User: { select: { id: true, userName: true, avatarUrl: true } } } },
// //       },
// //     }),
// //   ]);

// //   if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  
// //   return post;
// // };

// // const getMyPosts = async (authorId: string, page = 1, limit = 10) => {
// //   const skip = (page - 1) * limit;
// //   return prisma.post.findMany({
// //     where: { authorId },
// //     orderBy: { createdAt: 'desc' },
// //     take: limit,
// //     skip,
// //   });
// // };

// // const getAllPosts = async (type?: 'BLOG' | 'MEDIA', page = 1, limit = 10) => {
// //   const skip = (page - 1) * limit;
// //   return prisma.post.findMany({
// //     where: type ? { type } : {},
// //     orderBy: { createdAt: 'desc' },
// //     take: limit,
// //     skip,
// //     include: {
// //       Author: { select: { id: true, firstName: true, lastName: true, userFullName: true, image: true } },
// //       PostComment: { include: { Author: { select: { id: true, firstName: true, lastName: true, userFullName: true, image: true } } } },
// //       PostLike: { include: { User: { select: { id: true, firstName: true, lastName: true, userFullName: true, image: true } } } },
// //     },
// //   });
// // };

// // // ---------------- Comment ----------------

// // const addComment = async (authorId: string, postId: string, content: string) => {
// //   // 1️⃣ Comment create
// //   const comment = await prisma.postComment.create({
// //     data: { authorId, postId, content },
// //     include: { 
// //       Author: { select: { id: true, userFullName: true, image: true } } 
// //     },
// //   });

// //   // 2️⃣ Post fetch to get author
// //   const post = await prisma.post.findUnique({ where: { id: postId } });
// //   if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");

// //   // 3️⃣ Notification creation
// //   // যেই user post create করেছে, তাকে notify করবে
// //   await prisma.notifications.create({
// //     data: {
// //       receiverId: post.authorId,   // Post author কে notify
// //       senderId: authorId,          // Comment creator
// //       title: "New Comment on your Post",
// //       description: `${comment.Author.userFullName} commented on your post`,
// //       message: content,
// //       type: "COMMENT",
// //       entityId: postId,
// //       entityType: "POST",
// //     }
// //   });

// //   return comment;
// // };

// // const getComments = async (postId: string, limit = 20) => {
// //   return prisma.postComment.findMany({
// //     where: { postId },
// //     take: limit,
// //     orderBy: { createdAt: 'desc' },
// //     include: { Author: { select: { id: true, userName: true, avatarUrl: true } } },
// //   });
// // };

// // // ---------------- Like ----------------


// // const toggleLikePost = async (userId: string, postId: string) => {
// //   if (!postId) throw new AppError(httpStatus.BAD_REQUEST, "Post ID is required");

// //   const existingLike = await prisma.postLike.findUnique({
// //     where: { postId_userId: { postId, userId } },
// //   });

// //   // Post fetch to get author
// //   const post = await prisma.post.findUnique({ where: { id: postId } });
// //   if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");

// //   if (existingLike) {
// //     // Already liked → unlike
// //     await prisma.postLike.delete({
// //       where: { postId_userId: { postId, userId } },
// //     });

// //     // Notification for unlike (optional)
// //     await prisma.notifications.create({
// //       data: {
// //         receiverId: post.authorId,   // Post author কে notify
// //         senderId: userId,
// //         title: "Someone unliked your post",
// //         description: `A user unliked your post "${post.title}"`,
// //         type: "UNLIKE",
// //         entityId: postId,
// //         entityType: "POST",
// //       }
// //     });

// //     return { message: "Post unliked successfully" };
// //   } else {
// //     // Not liked → like
// //     await prisma.postLike.create({
// //       data: { postId, userId },
// //     });

// //     // Notification for like
// //     await prisma.notifications.create({
// //       data: {
// //         receiverId: post.authorId,   // Post author কে notify
// //         senderId: userId,
// //         title: "New Like on your post",
// //         description: `A user liked your post "${post.title}"`,
// //         type: "LIKE",
// //         entityId: postId,
// //         entityType: "POST",
// //       }
// //     });

// //     return { message: "Post liked successfully" };
// //   }
// // };


// // const getLikes = async (postId: string) => {
// //   return prisma.postLike.findMany({
// //     where: { postId },
// //     include: {
// //       User: { select: { id: true,firstName:true,lastName:true ,userFullName: true, image: true } },
// //     },
// //   });
// // };

// // // ---------------- Export ----------------

// // export const postService = {
// //   createPost,
// //   updatePost,
// //   deletePost,
// //   getPostById,
// //   getMyPosts,
// //   getAllPosts,
// //   addComment,
// //   getComments,
// //  toggleLikePost,
// //   getLikes,
// //   approvePost
// // };









// // post.service.ts
// import httpStatus from 'http-status';
// import AppError from '../../errors/AppError';
// import prisma from '../../utils/prisma';
// import { Server } from 'socket.io';
// import { connectedUsers } from '../socket/socketHandler';

// // ---------------- Post CRUD ----------------

// const createPost = async (
//   authorId: string,
//   title: string,
//   description: string,
//   type: 'BLOG' | 'MEDIA',
//   fileUrl?: string,
//   io?: Server
// ) => {
//   const post = await prisma.post.create({
//     data: { title, description, type, authorId, fileUrl },
//   });

//   const admins = await prisma.user.findMany({
//     where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
//     select: { id: true },
//   });

//   const notificationsData = admins.map(admin => ({
//     receiverId: admin.id,
//     senderId: authorId,
//     title: 'New Post Created',
//     message: `A new post titled "${title}" has been created by a user.`,
//     type: 'POST',
//     entityId: post.id,
//     entityType: 'POST',
//   }));

//   if (notificationsData.length > 0) {
//     await prisma.notifications.createMany({ data: notificationsData });

//     if (io) {
//       notificationsData.forEach(notification => {
//         const socketId = connectedUsers.get(notification.receiverId!);
//         if (socketId) io.to(socketId).emit('new_notification', notification);
//       });
//     }
//   }

//   return post;
// };

// const updatePost = async (
//   postId: string,
//   authorId: string,
//   data: { title?: string; description?: string; fileUrl?: string }
// ) => {
//   const post = await prisma.post.findUnique({ where: { id: postId } });
//   if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");
//   if (post.authorId !== authorId)
//     throw new AppError(httpStatus.FORBIDDEN, "You cannot update this post");

//   return prisma.post.update({ where: { id: postId }, data });
// };

// const approvePost = async (postId: string, status: 'APPROVED' | 'REJECTED', io?: Server) => {
//   const post = await prisma.post.findUnique({ where: { id: postId } });
//   if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");

//   const updatedPost = await prisma.post.update({
//     where: { id: postId },
//     data: { status },
//   });

//   const notification = {
//     receiverId: post.authorId,
//     senderId: null,
//     title: `Your post has been ${status.toLowerCase()}`,
//     message: `Your post "${post.title}" has been ${status.toLowerCase()} by admin.`,
//     type: 'POST',
//     entityId: postId,
//     entityType: 'POST',
//   };

//   await prisma.notifications.create({ data: notification });

//   if (io) {
//     const socketId = connectedUsers.get(post.authorId);
//     if (socketId) io.to(socketId).emit('new_notification', notification);
//   }

//   return updatedPost;
// };

// const deletePost = async (postId: string, authorId: string) => {
//   const post = await prisma.post.findUnique({ where: { id: postId } });
//   if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");
//   if (post.authorId !== authorId)
//     throw new AppError(httpStatus.FORBIDDEN, "You cannot delete this post");

//   return prisma.post.delete({ where: { id: postId } });
// };

// const getPostById = async (postId: string) => {
//   const post = await prisma.post.update({
//     where: { id: postId },
//     data: { views: { increment: 1 } },
//     include: {
//       Author: { select: { id: true, firstName: true, lastName: true, userName: true, avatarUrl: true } },
//       PostComment: { include: { Author: { select: { id: true, userName: true, avatarUrl: true } } } },
//       PostLike: { include: { User: { select: { id: true, userName: true, avatarUrl: true } } } },
//     },
//   });

//   if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");
//   return post;
// };

// const getMyPosts = async (authorId: string, page = 1, limit = 10) => {
//   const skip = (page - 1) * limit;
//   return prisma.post.findMany({
//     where: { authorId },
//     orderBy: { createdAt: 'desc' },
//     take: limit,
//     skip,
//   });
// };

// const getAllPosts = async (type?: 'BLOG' | 'MEDIA', page = 1, limit = 10) => {
//   const skip = (page - 1) * limit;
//   return prisma.post.findMany({
//     where: type ? { type } : {},
//     orderBy: { createdAt: 'desc' },
//     take: limit,
//     skip,
//     include: {
//       Author: { select: { id: true, firstName: true, lastName: true, userFullName: true, image: true } },
//       PostComment: { include: { Author: { select: { id: true, firstName: true, lastName: true, userFullName: true, image: true } } } },
//       PostLike: { include: { User: { select: { id: true, firstName: true, lastName: true, userFullName: true, image: true } } } },
//     },
//   });
// };

// // ---------------- Comment ----------------

// const addComment = async (authorId: string, postId: string, content: string, io?: Server) => {
//   const comment = await prisma.postComment.create({
//     data: { authorId, postId, content },
//     include: { Author: { select: { id: true, userFullName: true, image: true } } },
//   });

//   const post = await prisma.post.findUnique({ where: { id: postId } });
//   if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");

//   const notification = {
//     receiverId: post.authorId,
//     senderId: authorId,
//     title: "New Comment on your Post",
//     message: content,
//     type: "COMMENT",
//     entityId: postId,
//     entityType: "POST",
//   };

//   await prisma.notifications.create({ data: notification });

//   if (io) {
//     const socketId = connectedUsers.get(post.authorId);
//     if (socketId) io.to(socketId).emit('new_notification', notification);
//   }

//   return comment;
// };

// const getComments = async (postId: string, limit = 20) => {
//   return prisma.postComment.findMany({
//     where: { postId },
//     take: limit,
//     orderBy: { createdAt: 'desc' },
//     include: { Author: { select: { id: true, userName: true, avatarUrl: true } } },
//   });
// };
// const getUserHowManyComments = async (userId: string, ) => {
//   return prisma.postComment.findMany({
//     where: { authorId: userId },

//     orderBy: { createdAt: 'desc' },
//   include: { post: true }
//   });
// };

// // ---------------- Like ----------------

// const toggleLikePost = async (userId: string, postId: string, io?: Server) => {
//   if (!postId) throw new AppError(httpStatus.BAD_REQUEST, "Post ID is required");

//   const existingLike = await prisma.postLike.findUnique({
//     where: { postId_userId: { postId, userId } },
//   });

//   const post = await prisma.post.findUnique({ where: { id: postId } });
//   if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");

//   if (existingLike) {
//     await prisma.postLike.delete({ where: { postId_userId: { postId, userId } } });

//     const notification = {
//       receiverId: post.authorId,
//       senderId: userId,
//       title: "Someone unliked your post",
//       message: `A user unliked your post "${post.title}"`,
//       type: "UNLIKE",
//       entityId: postId,
//       entityType: "POST",
//     };

//     await prisma.notifications.create({ data: notification });

//     if (io) {
//       const socketId = connectedUsers.get(post.authorId);
//       if (socketId) io.to(socketId).emit('new_notification', notification);
//     }

//     return { message: "Post unliked successfully" };
//   } else {
//     await prisma.postLike.create({ data: { postId, userId } });

//     const notification = {
//       receiverId: post.authorId,
//       senderId: userId,
//       title: "New Like on your post",
//       message: `A user liked your post "${post.title}"`,
//       type: "LIKE",
//       entityId: postId,
//       entityType: "POST",
//     };

//     await prisma.notifications.create({ data: notification });

//     if (io) {
//       const socketId = connectedUsers.get(post.authorId);
//       if (socketId) io.to(socketId).emit('new_notification', notification);
//     }

//     return { message: "Post liked successfully" };
//   }
// };

// const getLikes = async (postId: string) => {
//   return prisma.postLike.findMany({
//     where: { postId },
//     include: { User: { select: { id: true, firstName: true, lastName: true, userFullName: true, image: true } } },
//   });
// };


// const getUserHowManyLikes = async (userId: string) => {
//   return prisma.postLike.findMany({
//     where: { userId },
//    include:{post:true}
//   });
// };

// // ---------------- Export ----------------

// export const postService = {
//   createPost,
//   updatePost,
//   deletePost,
//   getPostById,
//   getMyPosts,
//   getAllPosts,
//   addComment,
//   getComments,
//   toggleLikePost,
//   getLikes,
//   approvePost,
//   getUserHowManyLikes,
//   getUserHowManyComments
// };

// // ----------------------------------------------------
// // Note: connectedUsers map must be imported from your Socket.IO setup:
// // import { connectedUsers } from '../path_to_socket_handler';
// // ----------------------------------------------------





// post.service.ts
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { Server } from 'socket.io';
import { connectedUsers } from '../socket/socketHandler';
import { firebasePushNotificationServices } from '../Firebase/firebasePushNotificationServices';


// ---------------- Notification Helper ----------------
const notifyUserWithSocketAndPush = async (receiverId: string, notification: any, io?: Server) => {
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
      body: {
        title: notification.title,
        body: notification.message,
      },
    });
  }
};

// ---------------- Post CRUD ----------------
const createPost = async (
  authorId: string,
  title: string,
  description: string,
  type: 'BLOG' | 'MEDIA',
  fileUrl?: string,
  io?: Server
) => {
  const post = await prisma.post.create({ data: { title, description, type, authorId, fileUrl } });

  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
    select: { id: true },
  });

  const notificationsData = admins.map(admin => ({
    receiverId: admin.id,
    senderId: authorId,
    title: 'New Post Created',
    message: `A new post titled "${title}" has been created by a user.`,
    type: 'POST',
    entityId: post.id,
    entityType: 'POST',
  }));

  for (const notification of notificationsData) {
    await notifyUserWithSocketAndPush(notification.receiverId, notification, io);
  }

  return post;
};

const updatePost = async (
  postId: string,
  authorId: string,
  data: { title?: string; description?: string; fileUrl?: string }
) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  if (post.authorId !== authorId) throw new AppError(httpStatus.FORBIDDEN, "You cannot update this post");

  return prisma.post.update({ where: { id: postId }, data });
};

const approvePost = async (postId: string, status: 'APPROVED' | 'REJECTED', io?: Server) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");

  const updatedPost = await prisma.post.update({ where: { id: postId }, data: { status } });

  const notification = {
    receiverId: post.authorId,
    senderId: null,
    title: `Your post has been ${status.toLowerCase()}`,
    message: `Your post "${post.title}" has been ${status.toLowerCase()} by admin.`,
    type: 'POST',
    entityId: postId,
    entityType: 'POST',
  };

  await notifyUserWithSocketAndPush(post.authorId, notification, io);

  return updatedPost;
};

const deletePost = async (postId: string, authorId: string) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  if (post.authorId !== authorId) throw new AppError(httpStatus.FORBIDDEN, "You cannot delete this post");

  return prisma.post.delete({ where: { id: postId } });
};

const getPostById = async (postId: string) => {
  const post = await prisma.post.update({
    where: { id: postId },
    data: { views: { increment: 1 } },
    include: {
      Author: { select: { id: true, firstName: true, lastName: true, userName: true, avatarUrl: true } },
      PostComment: { include: { Author: { select: { id: true, userName: true, avatarUrl: true } } } },
      PostLike: { include: { User: { select: { id: true, userName: true, avatarUrl: true } } } },
    },
  });

  if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  return post;
};

const getMyPosts = async (authorId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return prisma.post.findMany({ where: { authorId }, orderBy: { createdAt: 'desc' }, take: limit, skip });
};

const getAllPosts = async (type?: 'BLOG' | 'MEDIA', page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return prisma.post.findMany({
    where: type ? { type } : {},
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip,
    include: {
      Author: { select: { id: true, firstName: true, lastName: true, userFullName: true, image: true } },
      PostComment: { include: { Author: { select: { id: true, firstName: true, lastName: true, userFullName: true, image: true } } } },
      PostLike: { include: { User: { select: { id: true, firstName: true, lastName: true, userFullName: true, image: true } } } },
    },
  });
};

// ---------------- Comment ----------------
const addComment = async (authorId: string, postId: string, content: string, io?: Server) => {
  const comment = await prisma.postComment.create({
    data: { authorId, postId, content },
    include: { Author: { select: { id: true, userFullName: true, image: true } } },
  });

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");

  const notification = {
    receiverId: post.authorId,
    senderId: authorId,
    title: "New Comment on your Post",
    message: content,
    type: "COMMENT",
    entityId: postId,
    entityType: "POST",
  };

  await notifyUserWithSocketAndPush(post.authorId, notification, io);

  return comment;
};

const getComments = async (postId: string, limit = 20) => {
  return prisma.postComment.findMany({
    where: { postId },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { Author: { select: { id: true, userName: true, avatarUrl: true } } },
  });
};

const getUserHowManyComments = async (userId: string) => {
  return prisma.postComment.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
    include: { post: true }
  });
};

// ---------------- Like ----------------
const toggleLikePost = async (userId: string, postId: string, io?: Server) => {
  if (!postId) throw new AppError(httpStatus.BAD_REQUEST, "Post ID is required");

  const existingLike = await prisma.postLike.findUnique({ where: { postId_userId: { postId, userId } } });
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post not found");

  const notification = {
    receiverId: post.authorId,
    senderId: userId,
    title: existingLike ? "Someone unliked your post" : "New Like on your post",
    message: existingLike
      ? `A user unliked your post "${post.title}"`
      : `A user liked your post "${post.title}"`,
    type: existingLike ? "UNLIKE" : "LIKE",
    entityId: postId,
    entityType: "POST",
  };

  if (existingLike) {
    await prisma.postLike.delete({ where: { postId_userId: { postId, userId } } });
  } else {
    await prisma.postLike.create({ data: { postId, userId } });
  }

  await notifyUserWithSocketAndPush(post.authorId, notification, io);

  return { message: existingLike ? "Post unliked successfully" : "Post liked successfully" };
};

const getLikes = async (postId: string) => {
  return prisma.postLike.findMany({
    where: { postId },
    include: { User: { select: { id: true, firstName: true, lastName: true, userFullName: true, image: true } } },
  });
};

const getUserHowManyLikes = async (userId: string) => {
  return prisma.postLike.findMany({
    where: { userId },
    include: { post: true }
  });
};

// ---------------- Export ----------------
export const postService = {
  createPost,
  updatePost,
  deletePost,
  getPostById,
  getMyPosts,
  getAllPosts,
  addComment,
  getComments,
  toggleLikePost,
  getLikes,
  approvePost,
  getUserHowManyLikes,
  getUserHowManyComments
};

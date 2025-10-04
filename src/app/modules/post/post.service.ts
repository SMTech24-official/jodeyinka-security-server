




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




const getMyPosts = async (
  authorId: string,
  page = 1,
  limit = 10,
  type?: 'BLOG' | 'MEDIA',
  status?: "APPLIED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED",
) => {
  const skip = (page - 1) * limit;

  const where: any = { authorId };
  if (type) where.type = type;
  if (status) where.status = status;

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  const total = await prisma.post.count({ where });

  return {
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    data: posts,
  };
};



const getAllPosts = async (
  type?: 'BLOG' | 'MEDIA',
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  // where condition
  const where: any = { status: "APPROVED" };
  if (type) where.type = type;

  // fetch posts with pagination
  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: 'desc' }, // newest first
    skip,
    take: limit,
    include: {
      Author: {
        select: { id: true, firstName: true, lastName: true, userFullName: true, image: true },
      },
      PostComment: {
        include: {
          Author: {
            select: { id: true, firstName: true, lastName: true, userFullName: true, image: true },
          },
        },
      },
      PostLike: {
        include: {
          User: {
            select: { id: true, firstName: true, lastName: true, userFullName: true, image: true },
          },
        },
      },
    },
  });

  // total count for pagination
  const total = await prisma.post.count({ where });

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: posts,
  };
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

const getComments = async (postId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  // fetch comments with pagination
  const comments = await prisma.postComment.findMany({
    where: { postId },
    orderBy: { createdAt: 'desc' }, // recent first
    skip,
    take: limit,
    include: {
      Author: {
        select: {
          id: true,
          userName: true,
          firstName: true,
          lastName: true,
          userFullName: true,
          image: true,
        },
      },
    },
  });

  // total comments count for meta
  const total = await prisma.postComment.count({ where: { postId } });

  // map to simplified author object
  const mappedComments = comments.map((comment) => ({
    id: comment.Author.id,
    firstName: comment.Author.firstName,
    lastName: comment.Author.lastName,
    userFullName: comment.Author.userFullName,
    image: comment.Author.image,
    userName: comment.Author.userName,
    comment: comment.content,
    createdAt: comment.createdAt,
  }));

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: mappedComments,
  };
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

const getLikes = async (postId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  // fetch likes with pagination
  const likes = await prisma.postLike.findMany({
    where: { postId },
    skip,
    take: limit,
    include: {
      User: {
        select: { id: true, firstName: true, lastName: true, userFullName: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' }, // recent likes first
  });

  // total likes count for meta
  const total = await prisma.postLike.count({ where: { postId } });

  // map to simplified user object
  const mappedLikes = likes.map(like => ({
    id: like.User.id,
    firstName: like.User.firstName,
    lastName: like.User.lastName,
    userFullName: like.User.userFullName,
    image: like.User.image,
  }));

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: mappedLikes,
  };
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

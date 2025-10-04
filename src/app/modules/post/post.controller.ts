import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { postService } from './post.service';

// ---------------- Post ----------------

const createPost = catchAsync(async (req: Request, res: Response) => {
  const { title, description, type, fileUrl } = req.body;



  const post = await postService.createPost(req.user.id, title, description, type, fileUrl);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Post created successfully',
    data: post,
  });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {  title, description, fileUrl } = req.body;

  const post = await postService.updatePost(id, req.user.id, { title, description, fileUrl });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post updated successfully',
    data: post,
  });
});


const approvePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {  data } = req.body;

  const post = await postService.approvePost(id,data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post updated successfully',
    data: post,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const post = await postService.deletePost(id, req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted successfully',
    data: post,
  });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  

  const post = await postService.getPostById(req.params.postId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post retrieved successfully',
    data: post,
  });
});

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  const { page = "1", limit = "10", type, status } = req.query;

  const posts = await postService.getMyPosts(
    req.user.id as string,
    parseInt(page as string, 10),
    parseInt(limit as string, 10),
    type as 'BLOG' | 'MEDIA' | undefined,
    status as "APPLIED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | undefined
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My posts retrieved successfully',
    data: posts,
  });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const { type, page, limit } = req.query;

  const posts = await postService.getAllPosts(
    type as 'BLOG' | 'MEDIA',
    Number(page) || 1,
    Number(limit) || 10
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Posts retrieved successfully',
    data: posts,
  });
});

// ---------------- Comment ----------------

const addComment = catchAsync(async (req: Request, res: Response) => {
  const { postId, content } = req.body;

  const comment = await postService.addComment(req.user.id, postId, content);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Comment added successfully',
    data: comment,
  });
});

const getComments = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { page = "1", limit = "20" } = req.query;

  const comments = await postService.getComments(
    postId,
    parseInt(page as string, 10),
    parseInt(limit as string, 10)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comments retrieved successfully',
    data: comments,
  });
});

// ---------------- Like ----------------

const toggleLikePost = catchAsync(async (req: Request, res: Response) => {
  console.log('hello')

  const result = await postService.toggleLikePost(req.user.id, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: result.message,
    data: null,
  });
});



const getLikes = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;

  const likes = await postService.getLikes(postId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Likes retrieved successfully',
    data: likes,
  });
});


const getUserHowManyLikes = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;

  const likes = await postService.getUserHowManyLikes(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Likes history retrieved successfully',
    data: likes,
  });
});


const getUserHowManyComments = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;

  const likes = await postService.getUserHowManyComments(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comments history retrieved successfully',
    data: likes,
  });
});

// ---------------- Export ----------------

export const postController = {
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

import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { resourceServices } from './resource.service';
import { uploadToS3 } from '../../helpers/fileUploaderToS3';
import pickValidFields from '../../utils/pickValidFields';

const createResource = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { type } = req.params;
  const payload = JSON.parse(req.body.body);
  let fileUrl = '';
  if (req.file) {
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;
    fileUrl = await uploadToS3(fileBuffer, originalName, mimeType);
  }
  const result = await resourceServices.createResource(
    userId,
    payload,
    fileUrl,
    type,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Resource created successfully.',
    data: result,
  });
});

const getResources = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.params;
  const paginationOptions = pickValidFields(req.query, ['limit', 'page']);
  const resources = await resourceServices.getResources(
    type,
    paginationOptions,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Resources retrieved successfully.',
    data: resources,
  });
});

const getSingleResource = catchAsync(async (req: Request, res: Response) => {
  const { resourceId } = req.params;
  const resource = await resourceServices.getSingleResource(resourceId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Resources retrieved successfully.',
    data: resource,
  });
});

const createCommentOnResource = catchAsync(
  async (req: Request, res: Response) => {
    const { resourceId } = req.params;
    const userId = req.user.id;
    const payload = req.body;
    const result = await resourceServices.createCommentOnResource(
      payload,
      userId,
      resourceId,
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Resource created successfully.',
      data: result,
    });
  },
);

const getCommentsOnResource = catchAsync(
  async (req: Request, res: Response) => {
    const { resourceId } = req.params;
    const comments = await resourceServices.getCommentsOnResource(resourceId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Comments retrieved successfully.',
      data: comments,
    });
  },
);

const getTrendingResources = catchAsync(async (req: Request, res: Response) => {
  const trending = await resourceServices.getTrendingResources();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trending resources retrieved successfully.',
    data: trending,
  });
});

export const resourceControllers = {
  createResource,
  getResources,
  getSingleResource,
  createCommentOnResource,
  getCommentsOnResource,
  getTrendingResources,
};

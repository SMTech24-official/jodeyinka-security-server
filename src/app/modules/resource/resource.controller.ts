import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { resourceServices } from './resource.service';
import { uploadToS3 } from '../../helpers/fileUploaderToS3';

const createResource = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
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
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Resource created successfully.',
    data: result,
  });
});

export const resourceControllers = {
  createResource,
};

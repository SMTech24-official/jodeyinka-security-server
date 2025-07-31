import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { JobService } from './job.service';
import pickValidFields from '../../utils/pickValidFields';

// Create Job
const createJob = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user.id;
  const jobData = { ...req.body, authorId };

  const result = await JobService.createJob(jobData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Job created successfully.',
    data: result,
  });
});

// Get All Jobs (with pagination)
const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;

  // req.query থেকে userId মুছে ফেলা হচ্ছে
  delete req.query.userId;

  const paginationOptions = pickValidFields(req.query, ['limit', 'page']);
  const searchParams = req.query.searchParams as string | undefined;

  const result = await JobService.getAllJobs(paginationOptions, searchParams, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Jobs retrieved successfully.',
    data: result.data,
  });
});


// Get Single Job by ID
const getSingleJob = catchAsync(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const result = await JobService.getSingleJobById(jobId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job retrieved successfully.',
    data: result,
  });
});

// Apply to a Job
const applyToJob = catchAsync(async (req: Request, res: Response) => {
  


  const {userId,jobId} = req.body

  const result = await JobService.applyToJob(userId, jobId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

// Get All Jobs Applied by a User
const getAppliedJobs = catchAsync(async (req: Request, res: Response) => {


  const result = await JobService.getAppliedJobsByUser(req.params.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Applied jobs retrieved successfully.',
    data: result,
  });
});

export const JobController = {
  createJob,
  getAllJobs,
  getSingleJob,
  applyToJob,
  getAppliedJobs,
};

import prisma from '../../utils/prisma';
import { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelpers } from '../../helpers/paginationHelper';
import { JobApplicationStatus } from '@prisma/client';

const createJob = async (data: {
  title: string;
  company: string;
  location: string;
  salary: number;
  salaryType: 'HOURLY' | 'MONTHLY' | 'YEARLY';
  authorId: string;
}) => {
  const job = await prisma.job.create({
    data,
  });
  return job;
};

// const getAllJobs = async (
//   paginationOptions: IPaginationOptions,
//   searchParams?: string
// ) => {
//   const { limit, skip } =
//     paginationHelpers.calculatePagination(paginationOptions);

//   const orConditions = [];

//   if (searchParams) {
//     orConditions.push(
//       { title: { contains: searchParams, mode: 'insensitive' } },
//       { company: { contains: searchParams, mode: 'insensitive' } },
//       { location: { contains: searchParams, mode: 'insensitive' } }
//     );
//   }

//   const whereCondition:any = orConditions.length > 0 ? { OR: orConditions } : {};

//   const jobs = await prisma.job.findMany({
//     where: whereCondition,
//     skip,
//     take: limit,
//     orderBy: {
//       createdAt: 'desc',
//     },
//     include: {
//       Author: true,
//       applications:true
//     },
//   });

//   const total = await prisma.job.count({ where: whereCondition });

//   return {
//     meta: {
//       total,
//       limit,
//       page: paginationOptions.page,
//     },
//     data: jobs,
//   };
// };

const getAllJobs = async (
  paginationOptions: IPaginationOptions,
  searchParams?: string,
  userId?: string // ইউজারের আইডি, যাকে দেখে চেক করবে আবেদন করেছে কিনা
) => {
  const { limit, skip } = paginationHelpers.calculatePagination(paginationOptions);

  const orConditions = [];

  if (searchParams) {
    orConditions.push(
      { title: { contains: searchParams, mode: 'insensitive' } },
      { company: { contains: searchParams, mode: 'insensitive' } },
      { location: { contains: searchParams, mode: 'insensitive' } }
    );
  }

  const whereCondition: any = orConditions.length > 0 ? { OR: orConditions } : {};

  // ডাটাবেজ থেকে চাকরি ও আবেদনকারীদের সাথে নিয়ে আসা
  const jobs = await prisma.job.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      Author: true,
      applications: {
        select: {
          applicantId: true, // applicantId টা নিয়ে আসছি
        },
      },
    },
  });

  const total = await prisma.job.count({ where: whereCondition });

  // প্রতিটি job এর জন্য চেক করবো userId এর সঙ্গে match করে কিনা আবেদন আছে
  const modifiedJobs = jobs.map((job) => {
    const isJobApplied = job.applications.some(app => app.applicantId === userId);
    return {
      isJobApplied,
      ...job,
      
    };
  });

  return {
    meta: {
      total,
      limit,
      page: paginationOptions.page,
    },
    data: modifiedJobs,
  };
};


const getSingleJobById = async (jobId: string) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      Author: true,
    },
  });

  return job;
};

const applyToJob = async (userId: string, jobId: string) => {
  const existing = await prisma.jobApply.findFirst({
    where: {
      applicantId: userId,
      jobId,
    },
  });

  if (existing) {
    // Already applied → Remove application (withdraw)
    await prisma.jobApply.delete({
      where: {
        id: existing.id,
      },
    });

    return {
      message: 'Application withdrawn successfully.',
      action: 'withdrawn',
    };
  }

  // Not applied yet → Apply now
  const application = await prisma.jobApply.create({
    data: {
      applicantId: userId,
      jobId,
    },
  });

  return {
    message: 'Applied to job successfully.',
    action: 'applied',
    data: application,
  };
};



const getAppliedJobsByUser = async (
  userId: string,
  status?: "APPLIED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED",
  page: number = 1,
  limit: number = 10
) => {
  // 1️⃣ প্রথমে userId অনুযায়ী সব applications নিয়ে আসা
  const allApplications = await prisma.jobApply.findMany({
    where: { applicantId: userId },
    include: {
      Job: {
        include: { Author: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2️⃣ যদি status থাকে, তখন JS filter করে নেওয়া
  let filteredApplications = allApplications;
  if (status) {
    filteredApplications = allApplications.filter(
      (app) => app.status === status
    );
  }

  // 3️⃣ Pagination
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedApplications = filteredApplications.slice(start, end);

  // 4️⃣ Total count
  const total = filteredApplications.length;

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: paginatedApplications,
  };
};


export const JobService = {
  createJob,
  getAllJobs,
  getSingleJobById,
  applyToJob,
  getAppliedJobsByUser,
};

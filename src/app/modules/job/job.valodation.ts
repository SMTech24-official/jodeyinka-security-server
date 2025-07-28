import { z } from 'zod';

const createJobValidation = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Job title is required!',
    }),
    company: z.string({
      required_error: 'Company name is required!',
    }),
    location: z.string({
      required_error: 'Location is required!',
    }),
    salary: z
      .number({
        required_error: 'Salary is required!',
      })
      .positive('Salary must be a positive number'),
    salaryType: z.enum(['HOURLY', 'MONTHLY', 'YEARLY'], {
      required_error: 'Salary type is required and must be one of: HOURLY, MONTHLY, YEARLY',
    }),
  }),
});

export const JobValidation = {
  createJobValidation,
};

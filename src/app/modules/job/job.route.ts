import express from 'express';
import { JobController } from './job.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { JobValidation } from './job.valodation';

const router = express.Router();

router.post('/', auth(), validateRequest(JobValidation.createJobValidation), JobController.createJob);
router.get('/', JobController.getAllJobs);
router.get('/:jobId', JobController.getSingleJob);
router.post('/:jobId/apply', auth(), JobController.applyToJob);
router.get('/applied/me/:userId', auth(), JobController.getAppliedJobs);

export const JobRoutes = router;

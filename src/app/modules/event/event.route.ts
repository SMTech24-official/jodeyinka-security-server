import express from 'express';
import { s3Multer } from '../../helpers/fileUploaderToS3';
import { eventControllers } from './event.controller';
import auth from '../../middlewares/auth';
const router = express.Router();

router
  .route('/')
  .post(auth(), s3Multer.single('eventImage'), eventControllers.createEvent);

export const eventRouter = router;

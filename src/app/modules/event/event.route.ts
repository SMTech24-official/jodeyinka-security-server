import express from 'express';
import { s3Multer } from '../../helpers/fileUploaderToS3';
import { eventControllers } from './event.controller';
import auth from '../../middlewares/auth';
const router = express.Router();

router
  .route('/')
  .get(eventControllers.getUpcomingEvents)
  .post(auth(), s3Multer.single('eventImage'), eventControllers.createEvent);
router.route('/upcoming').get(eventControllers.getUpcomingEvents);

export const eventRouter = router;

import express from 'express';
import auth from '../../middlewares/auth';
import { notificationControllers } from './notification.controller';
const router = express.Router();

router.get('/', auth(), notificationControllers.getNotifications);
router.get('/:id', auth(), notificationControllers.getMyNotification);

export const notificationRouter = router;

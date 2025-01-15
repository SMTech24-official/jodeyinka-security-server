import express from 'express';
import auth from '../../middlewares/auth';
import { eventUsersController } from './eventUsers.controller';
const router = express.Router();
router.post('/:eventId', auth(), eventUsersController.registerUserToEvent);

export const eventUsersRouter = router;

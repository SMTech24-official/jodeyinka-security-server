import express from 'express';
import { followController } from './follow.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post('/follow', auth(), followController.followUser);
router.post('/unfollow', auth(), followController.unfollowUser);
router.get('/followers/:userId', followController.getFollowers);
router.get('/following/:userId', followController.getFollowing);

export const followRouter = router;

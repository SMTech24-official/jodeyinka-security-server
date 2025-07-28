import express from 'express';
import { likeController } from './like.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post('/', auth(),likeController.toggleLike);
router.get('/likeResourceOwner/:userId', auth(),likeController.likeResourceOwner);


export const LikeRoutes = router;

import express from 'express';
import { postController } from './post.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// ---------------- Post Routes ----------------
router.post('/create', auth(), postController.createPost);
router.put('/:id', auth(), postController.updatePost);
router.patch('/:id', auth(), postController.approvePost);
router.delete('/:id', auth(), postController.deletePost);
router.get('/:postId', postController.getPostById);
router.get('/post/me', auth(), postController.getMyPosts);
router.get('/', postController.getAllPosts);

// ---------------- Comment Routes ----------------
router.post('/comment', auth(), postController.addComment);
router.get('/comment/:postId', postController.getComments);

// ---------------- Like Routes ----------------
router.post('/toggle-like/:id', auth(), postController.toggleLikePost);

router.get('/likes/:postId', postController.getLikes);

export const postRouters = router;

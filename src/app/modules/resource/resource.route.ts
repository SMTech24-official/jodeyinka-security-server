import express from 'express';
import auth from '../../middlewares/auth';
import { resourceControllers } from './resource.controller';
import { s3Multer } from '../../helpers/fileUploaderToS3';
const router = express.Router();

router
  .route('/type/:type')
  .get(resourceControllers.getResources)
  .post(
    auth(),
    s3Multer.single('resourceFile'),
    resourceControllers.createResource,
  );

router.route('/:resourceId').get(resourceControllers.getSingleResource);
router
  .route('/:resourceId/comment')
  .get(auth(), resourceControllers.getCommentsOnResource)
  .post(auth(), resourceControllers.createCommentOnResource);

export const resourceRouter = router;

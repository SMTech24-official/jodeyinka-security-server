import express from 'express';
import auth from '../../middlewares/auth';
import { resourceControllers } from './resource.controller';
import { s3Multer } from '../../helpers/fileUploaderToS3';
const router = express.Router();

router
  .route('/')
  .post(
    auth(),
    s3Multer.single('resourceFile'),
    resourceControllers.createResource,
  );

export const resourceRouter = router;

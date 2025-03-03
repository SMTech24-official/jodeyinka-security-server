import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserControllers } from './user.controller';
import { UserValidations } from './user.validation';
import { UserRoleEnum } from '@prisma/client';
import { s3Multer } from '../../helpers/fileUploaderToS3';
const router = express.Router();

router.post(
  '/register',
  validateRequest(UserValidations.registerUser),
  UserControllers.registerUser,
);
router.post(
  '/resend-verification-email',
  UserControllers.resendUserVerificationEmail,
);
router.get('/', UserControllers.getAllUsers);

router.get('/me', auth(), UserControllers.getMyProfile);
router.get(
  '/sponsorship-requests',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  UserControllers.getSponsorshipRequests,
);

router.patch(
  '/approve-sponsor/:userId',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  UserControllers.approveSponsorshipRequest,
);

router.delete(
  '/reject-sponsor/:userId',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  UserControllers.deleteSponsorshipRequest,
);

router.get('/:id', UserControllers.getUserDetails);
router.put(
  '/update-profile',
  auth(),
  s3Multer.fields([{ name: 'profileImage', maxCount: 1 }]),
  UserControllers.updateMyProfile,
);
router.patch('/verify-email/:token', UserControllers.verifyUserEmail);

router.put(
  '/update-user/:id',
  auth('ADMIN'),
  UserControllers.updateUserRoleStatus,
);

router.put('/change-password', auth(), UserControllers.changePassword);

export const UserRouter = router;

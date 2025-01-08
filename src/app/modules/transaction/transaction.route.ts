import express from 'express';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import { transactionControllers } from './transaction.controller';
const router = express.Router();
router
  .route('/')
  .get(
    auth(UserRoleEnum.SUPERADMIN),
    transactionControllers.getAllTransactions,
  );

export const transactionRouter = router;

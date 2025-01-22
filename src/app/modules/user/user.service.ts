import { SponsorStatus, User, UserRoleEnum, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import prisma from '../../utils/prisma';
import Email from '../../utils/email';
import { verification } from '../../helpers/generateEmailVerificationLink';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

interface UserWithOptionalPassword extends Omit<User, 'password'> {
  password?: string;
}

const registerUserIntoDB = async (payload: User) => {
  const hashedPassword: string = await bcrypt.hash(payload.password, 12);
  const userData = {
    ...payload,
    password: hashedPassword,
  };
  if (payload.organizationName) {
    userData.sponsorStatus = 'PENDING';
  }
  const newUser = await prisma.user.create({
    data: {
      ...userData,
    },
  });

  await resendUserVerificationEmail(newUser.email);
  const userWithOptionalPassword = newUser as UserWithOptionalPassword;
  delete userWithOptionalPassword.password;

  return userWithOptionalPassword;
};

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({});

  return result;
};

const getMyProfileFromDB = async (id: string) => {
  const Profile = await prisma.user.findUniqueOrThrow({
    where: {
      id: id,
    },
  });

  return Profile;
};

const getUserDetailsFromDB = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });
  return user;
};

const updateMyProfileIntoDB = async (id: string, payload: any) => {
  const userData = payload;
  delete userData.password;
  // update user data
  const updatedUser = await prisma.user.update({
    where: { id },
    data: userData,
  });

  const userWithOptionalPassword = updatedUser as UserWithOptionalPassword;
  delete userWithOptionalPassword.password;

  return userWithOptionalPassword;
};

const updateUserRoleStatusIntoDB = async (id: string, payload: any) => {
  const result = await prisma.user.update({
    where: {
      id: id,
    },
    data: { role: payload.role },
  });
  return result;
};

const changePassword = async (userId: string, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
      status: 'ACTIVE',
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password incorrect!');
  }

  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: 'Password changed successfully!',
  };
};

const verifyUserEmail = async (token: string) => {
  const hashedToken = verification.generateHashedToken(token);
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: hashedToken,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid email verification token.',
    );
  }
  if (
    user.emailVerificationTokenExpires &&
    user.emailVerificationTokenExpires < new Date(Date.now())
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Email verification token has expired. Please try resending the verification email again.',
    );
  }
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
    },
  });
  return updatedUser;
};

const resendUserVerificationEmail = async (email: string) => {
  const [emailVerificationLink, hashedToken] =
    verification.generateEmailVerificationLink();
  const user = await prisma.user.update({
    where: { email: email },
    data: {
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpires: new Date(Date.now() + 3600 * 1000),
    },
  });
  const emailSender = new Email(user);
  await emailSender.sendEmailVerificationLink(
    'Email verification link',
    emailVerificationLink,
  );
  return user;
};

const getSponsorshipRequests = async () => {
  const sponsorshipRequests = await prisma.user.findMany({
    where: {
      sponsorStatus: SponsorStatus.PENDING,
    },
  });

  return sponsorshipRequests;
};

const approveSponsorshipRequest = async (userId: string) => {
  const sponsorshipRequests = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      sponsorStatus: SponsorStatus.APPROVED,
      role: UserRoleEnum.SPONSOR,
    },
  });
  return sponsorshipRequests;
};

const deleteSponsorshipRequest = async (userId: string) => {
  const sponsorshipRequests = await prisma.user.delete({
    where: {
      id: userId,
    },
  });
  return sponsorshipRequests;
};
export const UserServices = {
  registerUserIntoDB,
  getAllUsersFromDB,
  getMyProfileFromDB,
  getUserDetailsFromDB,
  updateMyProfileIntoDB,
  updateUserRoleStatusIntoDB,
  changePassword,
  verifyUserEmail,
  resendUserVerificationEmail,
  getSponsorshipRequests,
  approveSponsorshipRequest,
  deleteSponsorshipRequest,
};

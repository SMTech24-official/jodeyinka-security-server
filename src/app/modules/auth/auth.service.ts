import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import AppError from '../../errors/AppError';
import { generateToken } from '../../utils/generateToken';
import prisma from '../../utils/prisma';
import { UserServices } from '../user/user.service';
import Email from '../../utils/email';

const loginUserFromDB = async (payload: {
  email: string;
  password: string;
}) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });
  const isCorrectPassword: Boolean = await bcrypt.compare(
    payload.password,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password incorrect');
  }
  if (!userData.isEmailVerified) {
    await UserServices.resendUserVerificationEmail(payload.email);
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Your email is not verified, please check your email for the verification link.',
    );
  }
  if (userData.twoFactor) {
    await twoFactor(userData.email);
    return {
      message: 'OTP sent to the mail successfully. Please check your email.',
    };
  }
  const accessToken = await generateToken(
    {
      id: userData.id,
      name: userData.firstName,
      email: userData.email,
      role: userData.role,
      sponsorStatus: userData.sponsorStatus,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string,
  );
  return {
    id: userData.id,
    name: userData.firstName,
    email: userData.email,
    role: userData.role,
    accessToken: accessToken,
    message: 'Logged in successfully.',
  };
};

const forgotPassword = async (email: string) => {
  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
  const user = await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      forgotPasswordOTP: randomOtp,
      forgotPasswordOTPExpires: otpExpiry,
    },
  });
  await new Email(user).sendPasswordReset(randomOtp);

  return;
};

const twoFactor = async (email: string) => {
  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
  const user = await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      twoFactorOTP: randomOtp,
      twoFactorOTPExpires: otpExpiry,
    },
  });
  await new Email(user).sendTwoFactorOTP(randomOtp);

  return;
};

const enterOTP = async (otp: string) => {
  const user = await prisma.user.findFirst({
    where: {
      forgotPasswordOTP: otp,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Incorrect OTP.');
  }
  if (
    user.forgotPasswordOTPExpires &&
    user.forgotPasswordOTPExpires < new Date(Date.now())
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'OTP has expired, please try resending the OTP again.',
    );
  }
  return;
};

const verify2faOTP = async (otp: string) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      twoFactorOTP: otp,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Incorrect OTP.');
  }
  if (
    user.twoFactorOTPExpires &&
    user.twoFactorOTPExpires < new Date(Date.now())
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'OTP has expired, please try resending the OTP again.',
    );
  }
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      twoFactorOTP: null,
      twoFactorOTPExpires: null,
    },
  });
  const accessToken = await generateToken(
    {
      id: user.id,
      name: user.firstName,
      email: user.email,
      role: user.role,
      sponsorStatus: user.sponsorStatus,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string,
  );
  return {
    id: user.id,
    name: user.firstName,
    email: user.email,
    role: user.role,
    accessToken: accessToken,
    message: 'Logged in successfully.',
  };
};

const resetPassword = async (email: string, otp: string, password: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
      forgotPasswordOTP: otp,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Could not change password, please try resetting the password again.',
    );
  }
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds) || 12,
  );
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      forgotPasswordOTP: null,
      forgotPasswordOTPExpires: null,
    },
  });
  return;
};

const refreshToken = async (userId: string) => {
  const userData = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  if (!userData) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'The user is not available anymore.',
    );
  }
  const accessToken = await generateToken(
    {
      id: userData.id,
      name: userData.firstName,
      email: userData.email,
      role: userData.role,
      sponsorStatus: userData.sponsorStatus,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string,
  );
  return accessToken;
};

export const AuthServices = {
  loginUserFromDB,
  forgotPassword,
  enterOTP,
  verify2faOTP,
  twoFactor,
  resetPassword,
  refreshToken,
};

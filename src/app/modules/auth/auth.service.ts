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
  const accessToken = await generateToken(
    {
      id: userData.id,
      name: userData.firstName,
      email: userData.email,
      role: userData.role,
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
  };
};

const forgotPassword = async (email: string) => {
  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
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
      'OTP has expired, please try again resending the OTP.',
    );
  }
  return;
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

export const AuthServices = {
  loginUserFromDB,
  forgotPassword,
  enterOTP,
  resetPassword,
};

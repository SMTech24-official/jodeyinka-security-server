import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import AppError from '../../errors/AppError';
import { generateToken } from '../../utils/generateToken';
import prisma from '../../utils/prisma';
import { mobileResendUserVerificationEmail, UserServices } from '../user/user.service';
import Email from '../../utils/email';

const loginUserFromDB = async (payload: {
  email: string;
  password: string;
}) => {
  const userData:any = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
     include:{Transaction:{select:{userId:true}}}
  });

    if (!userData.password) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password not found');
  }
  const isCorrectPassword: any = await bcrypt.compare(
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
    isSubscription: userData.Transaction && userData.Transaction.length > 0,
    message: 'Logged in successfully.',
  };
};


const mobileLogin = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  try {
    const userData = await prisma.user.findFirstOrThrow({
      where: { email },
    });

    if (!userData.password) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Password not found');
    }

    const isCorrectPassword = await bcrypt.compare(password, userData.password);
    if (!isCorrectPassword) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid password.');
    }

    if (!userData.isEmailVerified) {
      // isEmailVerified false hole OTP pathano hobe
      await mobileResendUserVerificationEmail(email); 
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Your email is not verified, please check your email for the verification link.',
      );
    }
    
    // twoFactor true hole OTP pathano hobe, normal login hobe na
    if (userData.twoFactor) {
      await mobileResendUserVerificationEmail(email);
      return {
        success: true,
        message: 'OTP sent for two-factor authentication. Please verify your email.',
        requiresOTPVerification: true
      };
    }

    // Two-factor na thakle, direct access token generate hobe
    const accessToken = "apnar-token-generation-logic"; // apnar generateToken function
    
    return {
      success: true,
      message: 'Logged in successfully.',
      data: {
        id: userData.id,
        name: userData.firstName,
        email: userData.email,
        role: userData.role,
        sponsorStatus: userData.sponsorStatus,
        accessToken,
      }
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Login failed. Please try again.');
  }
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



// OTP যাচাই করার সার্ভিস
// OTP verify korar function

// ধরে নিচ্ছি generateToken এবং config অন্য কোথাও থেকে আমদানি করা হয়েছে।
// import { generateToken } from '...'; 
// import config from '...'; 

const mobileVerifyOTP = async (email: string, otp: string, type?: string) => {

   
  try {
    const user:any = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'Invalid email.');
    }

    if (user.emailVerificationToken !== otp || !user.emailVerificationTokenExpires) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP or OTP has expired.');
    }

    if (new Date() > user.emailVerificationTokenExpires) {
      await prisma.user.update({
        where: { email },
        data: {
          emailVerificationToken: null,
          emailVerificationTokenExpires: null,
        },
      });
      throw new AppError(httpStatus.GONE, 'OTP has expired. Please generate a new one.');
    }

    await prisma.user.update({
      where: { email },
      data: {
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
        isEmailVerified: true,
      },
    });

    // Login টাইপ হলে, আপনার দেওয়া কোডটি ব্যবহার করে টোকেন এবং সাবস্ক্রিপশন ডেটা তৈরি করা হচ্ছে
    if (  type === 'login') {

    
      const accessToken = await generateToken(
        {
          id: user.id,
          name: user?.firstName + user.lastName||user.userFullName,
          email: user.email,
          role: user.role,
          sponsorStatus: user.sponsorStatus,
        },
        config.jwt.access_secret as Secret,
        config.jwt.access_expires_in as string,
      );

      // UserSubscription ডেটা খোঁজা হচ্ছে
      const subscriptions = await prisma.userSubscription.findFirst({
        where: { userId: user.id },
      });

      return {
        id: user.id,
        name: user.firstName,
        email: user.email,
        role: user.role,
        accessToken: accessToken,
        isSubscription: subscriptions ? true : false,
        message: 'Logged in successfully.',
      };
    }

    return {
      success: true,
      message: 'OTP verified successfully!',
    };
  } catch (error) {
    throw error;
  }
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
  if (!otp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP is required.');
  }
  const user:any = await prisma.user.findFirstOrThrow({
    where: {
      twoFactorOTP: otp,
      twoFactorOTPExpires: {
        gt: new Date(),
      },
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
  const subscriptions= await prisma.userSubscription.findFirst({where:{userId:user.id}})




  return {
    id: user.id,
    name: user.firstName,
    email: user.email,
    role: user.role,
    accessToken: accessToken,
   isSubscription:  subscriptions? true:false,
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
  const userData:any = await prisma.user.findFirst({
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





const googleLoginUserFromDB = async (payload: {
  email: string;
  userFullName: string;
}) => {
  // user টাইপ ঠিকভাবে দাও (যদি না পারো তাহলে any রাখা যাবে, তবে preferred নয়)
  let user: any = await prisma.user.findFirst({
    where: {
      email: payload.email,
    },
  });

  // যদি user না থাকে, তাহলে create করো
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: payload.email,
        userFullName: payload.userFullName,
        isEmailVerified: true,
        sponsorStatus:"PENDING"
      },
    });
  }

 
  // Token generate করো
  const accessToken = await generateToken(
    {
      id: user.id,
      name: user.userFullName,
      email: user.email,
      role: user.role,
      sponsorStatus: user.sponsorStatus,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  // Return final response
  return {
    id: user.id,
    name: user.userFullName,
    email: user.email,
    role: user.role,
    accessToken: accessToken,
    message: 'Logged in successfully.',
  };
};


export const AuthServices = {
  loginUserFromDB,
  forgotPassword,
  enterOTP,
  verify2faOTP,
  twoFactor,
  resetPassword,
  refreshToken,
  googleLoginUserFromDB,
  mobileVerifyOTP,
  mobileLogin
};

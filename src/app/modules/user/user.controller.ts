import httpStatus from 'http-status';
import { UserServices } from './user.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.registerUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message:
      'User registered successfully. Please check your email for the verification link.',
    data: result,
  });
});

const verifyUserEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params;
  const verifiedUser = await UserServices.verifyUserEmail(token);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User verified successfully.',
    data: verifiedUser,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Users Retrieve successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const id = req.user.id;
  const result = await UserServices.getMyProfileFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const getUserDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.getUserDetailsFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User details retrieved successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const id = req.user.id;
  const result = await UserServices.updateMyProfileIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User profile updated successfully',
    data: result,
  });
});

const updateUserRoleStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.updateUserRoleStatusIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User updated successfully',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await UserServices.changePassword(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
    data: result,
  });
});

const resendUserVerificationEmail = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await UserServices.resendUserVerificationEmail(email);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Verification email sent successfully',
      data: result,
    });
  },
);

export const UserControllers = {
  registerUser,
  getAllUsers,
  getMyProfile,
  getUserDetails,
  updateMyProfile,
  updateUserRoleStatus,
  changePassword,
  verifyUserEmail,
  resendUserVerificationEmail,
};

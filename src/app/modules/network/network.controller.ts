import httpStatus from "http-status";
import { networkService } from "./network.service";
import { Request, Response } from 'express';
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { getIOInstance } from "../../utils/socket";

// ==================== Group Controllers ====================

// Create new group
// const createGroup = catchAsync(async (req: Request, res: Response) => {
//   const { name, description } = req.body;
//   const creatorId = req.user.id; // auth middleware inject করেছে ধরে নিচ্ছি
//   const result = await networkService.createGroup({ name, description, creatorId });

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: "Group created successfully",
//     data: result,
//   });
// });

// // Invite member to group
// const addMember = catchAsync(async (req: Request, res: Response) => {
//   const { groupId, userId } = req.body;
//   const result = await networkService.addMember(groupId, userId);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Member invited successfully",
//     data: result,
//   });
// });

// // Accept group invitation
// const acceptInvitation = catchAsync(async (req: Request, res: Response) => {
//   const { memberId } = req.body;
//   const result = await networkService.acceptInvitation(memberId);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Invitation accepted",
//     data: result,
//   });
// });

// // Get all groups for the current user
// const getMyGroups = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.user.id;
//   const result = await networkService.getMyGroups(userId);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Groups retrieved successfully",
//     data: result,
//   });
// });

// ==================== Friend/Connection Controllers ====================

// Send friend request
const sendRequest = catchAsync(async (req: Request, res: Response) => {
  const senderId = req.user.id;
  const { receiverId } = req.body;

  const io = getIOInstance(); // Socket.IO instance নিলাম
  const result = await networkService.sendRequest(senderId, receiverId, io);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Friend request sent',
    data: result,
  });
});

// Respond to friend request
const respondRequest = catchAsync(async (req: Request, res: Response) => {
  const { requestId, status } = req.body;
  const io = getIOInstance();
  const result = await networkService.respondRequest(requestId, status, io);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Friend request ${status}`,
    data: result,
  });
});
// Get all accepted connections for the current user
const getMyConnections = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await networkService.getMyConnections(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Connections retrieved successfully",
    data: result,
  });
});


// Get requests received (pending)
const getReceivedRequests = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const requests = await networkService.getReceivedRequests(userId);
  res.status(200).json({ success: true, data: requests });
});

// Get requests sent (pending)
const getSentRequests = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const requests = await networkService.getSentRequests(userId);
  res.status(200).json({ success: true, data: requests });
});

export const networkController = {
  // Group
  // createGroup,
  // addMember,
  // acceptInvitation,
  // getMyGroups,

  // Friend
  sendRequest,
  respondRequest,
  getMyConnections,
  getReceivedRequests,
  getSentRequests
};

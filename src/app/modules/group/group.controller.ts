import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { GroupService } from "./group.service";


 const createGroup=catchAsync(async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const creatorId = req.user.id; // ধরে নিচ্ছি auth middleware আছে
    const group = await GroupService.createGroup(creatorId, name, description);
    res.json({ success: true, group });
  })

  const inviteMember= catchAsync(async (req: Request, res: Response) => {
    const { groupId, userId } = req.body;
    const member = await GroupService.inviteMember(groupId, userId);
    res.json({ success: true, member });
  })

  const acceptInvite= catchAsync(async (req: Request, res: Response) => {
    const { groupId } = req.body;
    const userId = req.user.id;
    const updated = await GroupService.acceptInvite(groupId, userId);
    res.json({ success: true, updated });
  })


  const rejectInvite= catchAsync(async (req: Request, res: Response) => {
    const { groupId } = req.body;
    const userId = req.user.id;
    const updated = await GroupService.rejectInvite(groupId, userId);
    res.json({ success: true, messages: "Invite rejected", updated });
  })

  const getMyGroups= catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const groups = await GroupService.getMyGroups(userId);
    res.json({ success: true, groups });
  })

  const  getGroupMessages= catchAsync(async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const messages = await GroupService.getGroupMessages(groupId);
    res.json({ success: true, messages });
  })

const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const notifications = await GroupService.getAllNotifications(userId);
  res.json({ success: true, data: notifications });
});


// User leaves group
const leaveGroup= catchAsync(async (req: Request, res: Response) => {
  const { groupId } = req.body;
  const result = await GroupService.leaveGroup(groupId, req.user.id);
  res.json({ success: true, message:"leave the group successfully" });
})

// Admin kicks user
const kickUser= catchAsync(async (req: Request, res: Response) => {
  const { groupId, userId } = req.body;
  const result = await GroupService.kickUser(groupId, req.user.id, userId);
  res.json({ success: true, message:" Admin kick the user successfully"  });
})
// Admin kicks user
const getAllMesagess= catchAsync(async (req: Request, res: Response) => {
  const { groupId, userId } = req.body;
  const result = await GroupService.getAllMesagess(groupId);
  res.json({ success: true, message:" Get all group message successfully" ,result });
})


export const GroupController = {
  createGroup,
  getGroupMessages,
  getMyGroups,
  acceptInvite,
  inviteMember,
  getNotifications,
  rejectInvite,
  leaveGroup,
  kickUser,
  getAllMesagess
}
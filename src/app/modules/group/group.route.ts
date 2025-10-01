import express from "express";
import { GroupController } from "./group.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/create", auth(), GroupController.createGroup);
router.post("/invite", auth(), GroupController.inviteMember);
router.post("/accept", auth(), GroupController.acceptInvite);
router.post("/reject", auth(), GroupController.rejectInvite);
router.get("/my-groups", auth(), GroupController.getMyGroups);
router.get("/all-notification", auth(), GroupController.getNotifications);
router.get("/:groupId/messages", auth(), GroupController.getGroupMessages);

router.post("/leave", auth(), GroupController.leaveGroup);
router.post("/kick", auth(), GroupController.kickUser);


export const GroupRoutes = router;

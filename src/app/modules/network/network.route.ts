import express from "express";
import { networkController } from "./network.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// ==================== Friend / Connection Routes ====================

// Send a friend request
router.post("/send-request", auth(), networkController.sendRequest);

// Respond to a friend request (accept/reject)
router.put("/respond-request", auth(), networkController.respondRequest);

// Get all accepted connections for the logged-in user
router.get("/connections", auth(), networkController.getMyConnections);


router.get("/requests/received", auth(), networkController.getReceivedRequests);

// Get requests sent (pending)
router.get("/requests/sent", auth(), networkController.getSentRequests);
// ==================== Group Routes ====================

// // Create a new group
// router.post("/groups", auth(), networkController.createGroup);

// // Invite/add member to a group
// router.post("/groups/add-member", auth(), networkController.addMember);

// // Accept group invitation
// router.post("/groups/accept", auth(), networkController.acceptInvitation);

// // Get all groups the logged-in user belongs to
// router.get("/groups/my", auth(), networkController.getMyGroups);

export const networkRoutes = router;

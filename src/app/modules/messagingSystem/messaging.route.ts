// src/app/modules/MessagingSystem/messagingSystem.route.ts

import express from 'express';
import {MessagingSystemController } from './messagingSystem.controller';
import auth from '../../middlewares/auth'; // যদি auth middleware ব্যবহার করো

const router = express.Router();

// ✅ GET /api/messaging/messages → ইউজারের মেসেজ আনবে
router.get('/messages/:senderId/:receverId',  MessagingSystemController.getMyMessages);
router.get('/getMyChatList/:id',  MessagingSystemController.getMyChatSidebar);

// ✅ GET /api/messaging/notifications → ইউজারের নোটিফিকেশন আনবে
router.get('/notifications/:id',MessagingSystemController.getMyNotifications);
router.get("/seenMessage/:userId1/:userId2", MessagingSystemController.getMessagesBetweenUsers);


export const MessagingSystemRoutes = router;

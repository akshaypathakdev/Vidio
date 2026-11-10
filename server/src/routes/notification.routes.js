import { Router } from "express";

import {
  getUserNotifications,
  getUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notification.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All notification routes require authentication.
router.use(verifyJWT);

// Fetch notifications.
router.get("/", getUserNotifications);

// Fetch unread notifications and their count.
router.get("/unread", getUnreadNotifications);
router.get("/unread-count", getUnreadNotificationCount);

// Mark notifications as read.
router.patch("/read-all", markAllNotificationsAsRead);
router.patch("/:notificationId/read", markNotificationAsRead);

export default router;

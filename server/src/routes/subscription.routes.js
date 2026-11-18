import { Router } from "express";
import {
  getSubscribedChannels,
  getChannelSubscribers,
  toggleSubscription,
  checkSubscriptionStatus,
} from "../controllers/subscription.controller.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import { isEmailVerified } from "../middlewares/emailVerification.middleware.js";

const router = Router();
router.get("/status/:channelId", optionalVerifyJWT, checkSubscriptionStatus);
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:channelId").post(isEmailVerified, toggleSubscription);
router.route("/s/:channelId").get(getChannelSubscribers);
router.route("/u/:userId").get(getSubscribedChannels);

export default router;

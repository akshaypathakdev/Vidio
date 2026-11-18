import { Router } from "express";

import {
  getChannelStats,
  getCurrentUserStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";

import { optionalVerifyJWT, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(optionalVerifyJWT);

// Public: Statistics of any channel
router.route("/stats/:userId").get(getChannelStats);

// Current user's statistics
router.route("/stats").get(verifyJWT, getCurrentUserStats);

// Protected: Videos of the current user
router.route("/videos").get(getChannelVideos);

export default router;

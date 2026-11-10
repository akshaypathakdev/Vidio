import { Router } from "express";
import {
  addToWatchLater,
  removeFromWatchLater,
  getWatchLaterVideos,
} from "../controllers/watchLater.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isEmailVerified } from "../middlewares/emailVerification.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getWatchLaterVideos);

router.patch("/add/:videoId", isEmailVerified, addToWatchLater);
router.patch("/remove/:videoId", isEmailVerified, removeFromWatchLater);

export default router;

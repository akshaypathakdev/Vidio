import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import {
  verifyJWT,
  optionalVerifyJWT,
} from "../middlewares/auth.middleware.js";
import { isEmailVerified } from "../middlewares/emailVerification.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, isEmailVerified, createTweet);
router.route("/user/:userId").get(optionalVerifyJWT, getUserTweets);
router
  .route("/:tweetId")
  .patch(verifyJWT, isEmailVerified, updateTweet)
  .delete(verifyJWT, isEmailVerified, deleteTweet);

export default router;

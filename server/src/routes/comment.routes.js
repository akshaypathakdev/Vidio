import { Router } from "express";

import {
  addComment,
  addReply,
  deleteComment,
  getCommentById,
  getReplies,
  getRepliesCount,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isEmailVerified } from "../middlewares/emailVerification.middleware.js";

const router = Router();

// Video comments
router
  .route("/:videoId")
  .get(getVideoComments)
  .post(verifyJWT, isEmailVerified, addComment);

// Individual comment
router
  .route("/c/:commentId")
  .get(getCommentById)
  .patch(verifyJWT, isEmailVerified, updateComment)
  .delete(verifyJWT, isEmailVerified, deleteComment);

// Replies
router
  .route("/c/:commentId/replies")
  .get(getReplies)
  .post(verifyJWT, isEmailVerified, addReply);

// Reply count
router.route("/c/:commentId/replies/count").get(getRepliesCount);

export default router;

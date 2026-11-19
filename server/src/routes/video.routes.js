import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  recordVideoView,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
  streamVideo,
  streamHLSFile,
  createStreamToken,
  getVideosByUsername,
  searchVideos,
  getMyVideos,
  getRandomVideoFeed,
} from "../controllers/video.controller.js";
import {
  verifyJWT,
  verifyStreamToken,
  optionalVerifyJWT,
} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isEmailVerified } from "../middlewares/emailVerification.middleware.js";

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/")
  .get(optionalVerifyJWT, getAllVideos)
  .post(
    verifyJWT,
    isEmailVerified,
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

router.route("/search").get(optionalVerifyJWT, searchVideos);
router.route("/me").get(verifyJWT, getMyVideos);

router.route("/feed").get(optionalVerifyJWT, getRandomVideoFeed);

router
  .route("/:videoId")
  .get(optionalVerifyJWT, getVideoById)
  .delete(verifyJWT, isEmailVerified, deleteVideo)
  .patch(verifyJWT, isEmailVerified, upload.single("thumbnail"), updateVideo);

router.post("/:videoId/view", optionalVerifyJWT, recordVideoView);

router.route("/c/:username/videos").get(optionalVerifyJWT, getVideosByUsername);

router
  .route("/toggle/publish/:videoId")
  .patch(verifyJWT, isEmailVerified, togglePublishStatus);

router
  .route("/:videoId/stream-token")
  .post(optionalVerifyJWT, createStreamToken);

router.route("/:videoId/stream").get(verifyStreamToken, streamVideo);
router.route("/stream/{*hlsPath}").get(verifyStreamToken, streamHLSFile);

export default router;

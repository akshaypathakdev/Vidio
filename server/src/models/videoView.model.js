import mongoose, { Schema } from "mongoose";

const videoViewSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },

    viewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // User ID for authenticated viewers, session ID for anonymous viewers.
    viewerKey: {
      type: String,
      required: true,
    },

    sessionId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

videoViewSchema.index(
  {
    video: 1,
    viewerKey: 1,
    sessionId: 1,
  },
  {
    unique: true,
  }
);

export const VideoView = mongoose.model("VideoView", videoViewSchema);

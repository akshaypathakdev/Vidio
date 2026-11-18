import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Notification } from "../models/notification.model.js";
import { getSocketIO } from "../sockets/socket.manager.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new APIError(401, "Unauthorized Request!");
  }

  const { channelId } = req.params;
  const subscriberId = req.user._id;

  // Validate channel ID
  if (!channelId) {
    throw new APIError(400, "Channel ID is required!");
  }

  if (!mongoose.isValidObjectId(channelId)) {
    throw new APIError(400, "Invalid channel ID!");
  }

  // Find channel
  const channel = await User.findById(channelId);

  if (!channel) {
    throw new APIError(404, "Channel not found!");
  }

  // Prevent self-subscription
  if (channel._id.equals(subscriberId)) {
    throw new APIError(400, "You cannot subscribe to yourself!");
  }

  // Check existing subscription
  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriberId,
  });

  let isSubscribed;

  if (existingSubscription) {
    // Unsubscribe
    await existingSubscription.deleteOne();
    isSubscribed = false;
  } else {
    // Subscribe
    const subscription = await Subscription.create({
      channel: channelId,
      subscriber: subscriberId,
    });

    isSubscribed = true;

    // Create notification
    const notification = await Notification.create({
      recipient: channelId,
      sender: subscriberId,
      type: "new_subscriber",
      message: `${req.user.username} subscribed to your channel`,
      resource: subscription._id,
    });

    // Emit real-time notification
    const io = getSocketIO();

    io.to(`userId:${channelId}`).emit("notification", notification);
  }

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        { isSubscribed },
        isSubscribed
          ? "Channel subscribed successfully"
          : "Channel unsubscribed successfully"
      )
    );
});

const getChannelSubscribers = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new APIError(401, "Unauthorized request!");
  }

  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new APIError(400, "Invalid channel ID");
  }

  const channel = await User.findById(channelId).select("_id");

  if (!channel) {
    throw new APIError(404, "Channel not found");
  }

  const { page = 1, limit = 20, sortType = "desc" } = req.query;

  const subscribers = await Subscription.aggregatePaginate(
    Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscriberDetails",
          pipeline: [
            {
              $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },

      {
        $unwind: "$subscriberDetails",
      },

      {
        $sort: {
          createdAt: sortType === "asc" ? 1 : -1,
        },
      },
    ]),
    {
      page: Number(page),
      limit: Number(limit),
    }
  );

  return res
    .status(200)
    .json(
      new APIResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new APIError(401, "Unauthorized request!");
  }

  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    throw new APIError(400, "Invalid user ID");
  }

  const channel = await User.findById(userId).select("_id");

  if (!channel) {
    throw new APIError(404, "User not found");
  }

  const { page = 1, limit = 20, sortType = "desc" } = req.query;

  const subscribedChannels = await Subscription.aggregatePaginate(
    Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(userId),
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channelDetails",
          pipeline: [
            {
              $project: {
                username: 1,
                avatar: 1,
                fullName: 1,
              },
            },
          ],
        },
      },

      {
        $unwind: "$channelDetails",
      },

      {
        $sort: {
          createdAt: sortType === "asc" ? 1 : -1,
        },
      },
    ]),
    {
      page: Number(page),
      limit: Number(limit),
    }
  );

  // if (subscribedChannels.docs.length === 0) {
  //   throw new APIError(404, "No subscribed channel found");
  // }

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

const checkSubscriptionStatus = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new APIError(400, "Channel id is required!");
  }

  if (!mongoose.isValidObjectId(channelId)) {
    throw new APIError(400, "Invalid channel id!");
  }

  const channel = await User.findById(channelId).select("_id");

  if (!channel) {
    throw new APIError(404, "Channel not found!");
  }

  let isSubscribed = false;

  if (req.user) {
    const subscription = await Subscription.exists({
      channel: channelId,
      subscriber: req.user._id,
    });

    isSubscribed = Boolean(subscription);
  }

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        { isSubscribed },
        "Subscription status fetched successfully"
      )
    );
});

export {
  toggleSubscription,
  getSubscribedChannels,
  getChannelSubscribers,
  checkSubscriptionStatus,
};

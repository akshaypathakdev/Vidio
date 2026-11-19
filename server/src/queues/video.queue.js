import { Queue } from "bullmq";

import { redisConnection } from "../config/redis.js";

const videoProcessingQueue = new Queue("video-processing", {
  connection: redisConnection,

  defaultJobOptions: {
    attempts: 3, //BullMQ allows up to three total attempts, including the initial attempt

    backoff: {
      type: "exponential", //Increases the delay between retries
      delay: 5000, //Starts with a 5-second delay
    },

    removeOnComplete: {
      age: 86400, // retains Completed jobs for up to 24 hours.
      count: 1000,
    },

    removeOnFail: {
      age: 604800, // Failed jobs for up to 7 days.
      count: 5000,
    },
  },
});

export { videoProcessingQueue };

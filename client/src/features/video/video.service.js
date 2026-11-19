import api from "../../services/api.js";
import withAuth from "../../services/withAuth.js";

const uploadVideo = async (
  { title, description, tags, videoFile, thumbnail },
  onUploadProgress,
) => {
  const formData = new FormData();

  formData.append("title", title.trim());
  formData.append("description", description.trim());

  const parsedTags = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  parsedTags.forEach((tag) => {
    formData.append("tags", tag);
  });

  formData.append("videoFile", videoFile);

  if (thumbnail) {
    formData.append("thumbnail", thumbnail);
  }

  const response = await withAuth(() =>
    api.post("/videos", formData, {
      onUploadProgress,
    }),
  );

  return response.data.data;
};

// Public: Anyone can watch a video.
const getVideo = async (videoId) => {
  const response = await api.get(`/videos/${videoId}`);

  return response.data.data;
};

// Public: Fetches the public video feed.
const getMyVideos = async () => {
  const response = await api.get("/videos/me");

  return response.data.data;
};

// Optional authentication: Anonymous users can also request a stream token.
const getStreamToken = async (videoId) => {
  const response = await api.post(`/videos/${videoId}/stream-token`);

  return response.data.data.token;
};

const getStreamUrl = (videoId) => {
  return `${api.defaults.baseURL}/videos/${videoId}/stream`;
};

const getHlsFileUrl = (processingId, path) => {
  return `${api.defaults.baseURL}/videos/stream/${processingId}/${path}`;
};

// Optional authentication: Recording a video view does not require login.
async function recordVideoView(videoId, sessionId) {
  const response = await api.post(`/videos/${videoId}/view`, {
    sessionId,
  });

  return response.data.data;
}

const updateVideo = async ({
  videoId,
  title,
  description,
  tags,
  thumbnail,
}) => {
  const formData = new FormData();

  formData.append("title", title);
  formData.append("description", description);
  formData.append("tags", tags);

  if (thumbnail) {
    formData.append("thumbnail", thumbnail);
  }

  const response = await withAuth(() =>
    api.patch(`/videos/${videoId}`, formData),
  );

  return response.data;
};

const togglePublishStatus = async (videoId) => {
  const response = await withAuth(() =>
    api.patch(`/videos/toggle/publish/${videoId}`),
  );

  return response.data;
};

const deleteVideo = async (videoId) => {
  const response = await withAuth(() => api.delete(`/videos/${videoId}`));

  return response.data.data;
};

// Protected: Like operations require authentication.
const toggleVideoLike = async (videoId) => {
  const response = await withAuth(() => api.post(`/likes/toggle/v/${videoId}`));

  return response.data.data;
};

const getLikedVideos = async () => {
  const response = await withAuth(() => api.get("/likes/videos"));

  return response.data.data;
};

// Protected: Watch Later operations require authentication.
const getWatchLaterVideos = async () => {
  const response = await withAuth(() => api.get("/watch-later/"));

  return response.data.data;
};

const addToWatchLater = async (videoId) => {
  const response = await withAuth(() =>
    api.patch(`/watch-later/add/${videoId}`),
  );

  return response.data.data;
};

const removeFromWatchLater = async (videoId) => {
  const response = await withAuth(() =>
    api.patch(`/watch-later/remove/${videoId}`),
  );

  return response.data.data;
};

export {
  getHlsFileUrl,
  getStreamToken,
  getStreamUrl,
  getVideo,
  getMyVideos,
  recordVideoView,
  updateVideo,
  togglePublishStatus,
  deleteVideo,
  uploadVideo,
  toggleVideoLike,
  getLikedVideos,
  getWatchLaterVideos,
  addToWatchLater,
  removeFromWatchLater,
};

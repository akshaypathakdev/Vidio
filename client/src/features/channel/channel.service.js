import api from "../../services/api.js";
import withAuth from "../../services/withAuth.js";

// Public channel statistics
async function getChannelStats(userId, signal) {
  const response = await api.get(`/dashboard/stats/${userId}`, {
    signal,
  });

  return response.data.data;
}

// Authenticated user's statistics
async function getCurrentUserStats(signal) {
  return withAuth(async () => {
    const response = await api.get("/dashboard/stats", {
      signal,
    });

    return response.data.data;
  });
}

// Authenticated user's videos
async function getChannelVideos(signal) {
  return withAuth(async () => {
    const response = await api.get("/dashboard/videos", {
      signal,
    });

    return response.data.data.docs || [];
  });
}

// Public channel profile
async function getUserChannel(username, signal) {
  const response = await api.get(`/users/c/${username}`, {
    signal,
  });

  return response.data.data;
}

// Update channel details
async function updateChannelDetails(fullName, username) {
  return withAuth(async () => {
    const response = await api.patch("/users/update-details", {
      fullName,
      username,
    });

    return response.data;
  });
}

// Update channel files
async function updateChannelFiles(formData) {
  return withAuth(async () => {
    const response = await api.patch("/users/update-files", formData);

    return response.data;
  });
}

// Public channel videos
async function getUserChannelVideos(username, signal) {
  const response = await api.get(`/videos/c/${username}/videos`, {
    signal,
  });

  return response.data.data;
}

// Toggle subscription
async function toggleSubscription(channelId) {
  return withAuth(async () => {
    const response = await api.post(`/subscriptions/c/${channelId}`);

    console.log(response.data.data)

    return response.data.data;
  });
}

// Authenticated user's playlists
async function getChannelPlaylists(signal) {
  return withAuth(async () => {
    const response = await api.get("/playlist/user/me", { signal });

    const data = response.data.data;
    return Array.isArray(data) ? data : data?.docs || [];
  });
}

// Public channel playlists
async function getUserChannelPlaylists(username, signal) {
  const response = await api.get(
    `/playlist/user/username/${encodeURIComponent(username)}`,
    { signal },
  );

  const data = response.data.data;
  return Array.isArray(data) ? data : data?.docs || [];
}

export {
  getChannelStats,
  getCurrentUserStats,
  getChannelVideos,
  updateChannelDetails,
  updateChannelFiles,
  getUserChannelVideos,
  toggleSubscription,
  getUserChannel,
  getUserChannelPlaylists,
  getChannelPlaylists,
};

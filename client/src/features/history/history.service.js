import api from "../../services/api.js";
import withAuth from "../../services/withAuth.js";

async function getWatchHistory(signal) {
  return withAuth(async () => {
    const response = await api.get("/users/history", {
      signal,
    });

    return response.data?.data || [];
  });
}

async function clearWatchHistory() {
  return withAuth(async () => {
    const response = await api.delete("/users/history/clear");

    return response.data;
  });
}

async function removeFromWatchHistory(videoId) {
  return withAuth(async () => {
    const response = await api.delete(`/users/history/clear/${videoId}`);

    return response.data;
  });
}

export { getWatchHistory, clearWatchHistory, removeFromWatchHistory };

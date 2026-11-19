import api from "../../services/api.js";

const getRandomVideoFeed = async ({ page = 1, limit = 20, seed }) => {
  const response = await api.get("/videos/feed", {
    params: {
      page,
      limit,
      seed,
    },
  });

  return response.data.data;
};

export { getRandomVideoFeed };

async function withAuth(request) {
  try {
    return await request();
  } catch (error) {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event("auth:required"));
    }

    throw error;
  }
}

export default withAuth;

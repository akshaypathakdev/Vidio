import api from "../../services/api.js";
import withAuth from "../../services/withAuth.js";

async function changeEmail(currentEmail, newEmail) {
  return withAuth(async () => {
    const response = await api.post("/users/change-email", {
      currentEmail,
      newEmail,
    });

    return response.data;
  });
}

async function changePassword(currentPassword, newPassword) {
  return withAuth(async () => {
    const response = await api.post("/users/change-password", {
      currentPassword,
      newPassword,
    });

    return response.data;
  });
}

async function logoutUser() {
  return withAuth(async () => {
    const response = await api.post("/users/logout");

    return response.data;
  });
}

export { changeEmail, changePassword, logoutUser };

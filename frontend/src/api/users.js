import api from "./client";

export const updateProfile = (data) =>
  api.patch("/users/profile", data).then((res) => res.data);
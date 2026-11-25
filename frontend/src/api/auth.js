import api from "./client";

export const requestOtp = (email) =>
  api.post("/auth/request-otp", { email }).then((res) => res.data);

export const verifyOtp = (email, otp) =>
  api.post("/auth/verify-otp", { email, otp }).then((res) => res.data);

export const getMe = () => api.get("/auth/me").then((res) => res.data);
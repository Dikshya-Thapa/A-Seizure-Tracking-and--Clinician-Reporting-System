import api from "./client";

export const createSeizure = (data) =>
  api.post("/seizures", data).then((res) => res.data);

export const getSeizures = () => api.get("/seizures").then((res) => res.data);
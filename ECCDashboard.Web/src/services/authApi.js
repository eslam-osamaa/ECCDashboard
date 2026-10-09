
import apiClient from "./apiClient";

export const login = async (email, password) => {
  const response = await apiClient.post("/Auth/login", {
    email,
    password,
  });

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get("/Auth/me");

  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post("/Auth/logout");

  return response.data;
};


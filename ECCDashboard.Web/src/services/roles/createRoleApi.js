import apiClient from "../apiClient";

export const createRole = async (data) => {
  const response = await apiClient.post("/Roles", data);
  return response.data;
};
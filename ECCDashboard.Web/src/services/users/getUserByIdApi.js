import apiClient from "../apiClient";

export const getUserById = async (id) => {
  const response = await apiClient.get(`/Users/${id}`);

  return response.data;
};
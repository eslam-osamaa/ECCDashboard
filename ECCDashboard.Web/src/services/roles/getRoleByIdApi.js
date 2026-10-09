import apiClient from "../apiClient";

export const getRoleById = async (id) => {
  const response = await apiClient.get(
    `/Roles/${id}`
  );

  return response.data;
};
import apiClient from "../apiClient";

export const deleteRole = async (id) => {
  const response = await apiClient.delete(
    `/Roles/${id}`
  );

  return response.data;
};
import apiClient from "../apiClient";

export const updateRole = async (
  id,
  data
) => {
  const response = await apiClient.put(
    `/Roles/${id}`,
    data
  );

  return response.data;
};
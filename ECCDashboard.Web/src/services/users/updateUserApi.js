import apiClient from "../apiClient";

export const updateUser = async (id, formData) => {
  const response = await apiClient.put(
    `/Users/${id}`,
    formData
  );

  return response.data;
};
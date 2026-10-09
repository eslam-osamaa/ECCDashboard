
import apiClient from "../apiClient";

export const deleteUser = async (id) => {
  const response = await apiClient.delete(
    `/Users/${id}`
  );

  return response.data;
};


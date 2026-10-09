import apiClient from "../apiClient";

export const getRoles = async ({
  page = 1,
  pageSize = 10,
} = {}) => {
  const response = await apiClient.get("/Roles", {
    params: {
      page,
      pageSize,
    },
  });

  return response.data;
};
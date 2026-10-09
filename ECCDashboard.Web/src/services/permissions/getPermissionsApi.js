import apiClient from "../apiClient";

export const getPermissions = async ({
  page = 1,
  pageSize = 100,
} = {}) => {
  const response = await apiClient.get(
    "/Permissions",
    {
      params: {
        page,
        pageSize,
      },
    }
  );

  return response.data;
};
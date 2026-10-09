import apiClient from "../apiClient";

export const getUsers = async ({
  page = 1,
  pageSize = 10,
  search = "",
  roleId = "",
} = {}) => {
  const response = await apiClient.get("/Users", {
    params: {
      page,
      pageSize,
      search: search || undefined,
      roleId: roleId || undefined,
    },
  });

  return response.data;
};
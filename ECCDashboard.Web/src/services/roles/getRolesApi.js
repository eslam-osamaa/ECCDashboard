
import apiClient from "../apiClient";

export const getRoles = async ({
  page = 1,
  pageSize = 10,
  search = "",
} = {}) => {
  const params = {
    page,
    pageSize,
  };

  const searchTerm = search.trim();

  if (searchTerm) {
    params.search = searchTerm;
  }

  const response = await apiClient.get("/Roles", {
    params,
  });

  return response.data;
};
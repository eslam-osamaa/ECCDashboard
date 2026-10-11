import apiClient from "../apiClient";

const ENDPOINTS = {
  cosmetics: "/formulations/cosmetics",
  makeup: "/formulations/makeup",
};

const getEndpoint = (type) => {
  const normalized = type?.toLowerCase();
  const endpoint = ENDPOINTS[normalized];

  if (!endpoint) {
    throw new Error(`Unsupported formulation type: ${type}`);
  }

  return endpoint;
};

const formulationsService = {
  getAll: async (type, params = {}, signal) => {
    const endpoint = getEndpoint(type);

    const response = await apiClient.get(endpoint, {
      params,
      signal,
    });

    return response.data;
  },

  getBySfg: async (sfg, signal) => {
    const response = await apiClient.get(
      `/formulations/${encodeURIComponent(sfg)}`,
      { signal }
    );

    return response.data;
  },

  changeStatus: async (sfg, status) => {
    const response = await apiClient.put(
      `/formulations/${encodeURIComponent(sfg)}/status`,
      { status }
    );

    return response.data;
  },

  delete: async (sfg, type) => {
    const normalized = type?.toLowerCase();

    if (normalized !== "cosmetics" && normalized !== "makeup") {
      throw new Error(`Unsupported formulation type: ${type}`);
    }

    const response = await apiClient.delete(
      `/formulations/${normalized}/${encodeURIComponent(sfg)}`
    );

    return response.data;
  },
};

export default formulationsService;
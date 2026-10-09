import apiClient from "../apiClient";

const endpoints = {
Cosmetics: "/formulations/cosmetics",
Makeup: "/formulations/makeup",
};

const formulationsService = {
getAll: async (type, params = {}, signal) => {
const endpoint = endpoints[type];

if (!endpoint) {
  throw new Error(`Unsupported formulation type: ${type}`);
}

const response = await apiClient.get(endpoint, {
  params,
  signal,
});

return response.data;


},
};

export default formulationsService;

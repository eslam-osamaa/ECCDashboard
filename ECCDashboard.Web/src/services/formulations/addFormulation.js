import apiClient from "../apiClient";

const addFormulation = async (formulation, type = "Cosmetics") => {
const normalizedType = type.toLowerCase();

const endpoints = {
cosmetics: "/formulations/cosmetics/full",
makeup: "/formulations/makeup/full",
};

const endpoint = endpoints[normalizedType];

if (!endpoint) {
throw new Error(`Unsupported formulation type: ${type}`);
}

const response = await apiClient.post(endpoint, formulation);

return response.data;
};

export default addFormulation;

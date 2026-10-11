import apiClient from "../apiClient";

const ENDPOINTS = {
  cosmetics: "/formulations/cosmetics/full",
  makeup: "/formulations/makeup/full",
};

const addFormulation = async (formulation, type = "Cosmetics") => {
  const normalizedType = type.toLowerCase();
  const endpoint = ENDPOINTS[normalizedType];

  if (!endpoint) {
    throw new Error(`Unsupported formulation type: ${type}`);
  }

  const payload = {
    sfg: formulation.sfg,
    parentCode: formulation.parentCode,
    description: formulation.description,
    status: formulation.status,
    rawMaterials: formulation.rawMaterials,
  };

  const response = await apiClient.post(endpoint, payload);
  return response.data;
};

export default addFormulation;
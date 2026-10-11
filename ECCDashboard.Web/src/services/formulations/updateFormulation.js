import apiClient from "../apiClient";

const ENDPOINTS = {
  cosmetics: "/formulations/cosmetics",
  makeup: "/formulations/makeup",
};

const updateFormulation = async (sfg, formulation, type = "Cosmetics") => {
  const normalizedType = type.toLowerCase();
  const endpoint = ENDPOINTS[normalizedType];

  if (!endpoint) {
    throw new Error(`Unsupported formulation type: ${type}`);
  }

  const payload = {
    parentCode: formulation.parentCode ?? "",
    description: formulation.description ?? "",
    rawMaterials: (formulation.rawMaterials ?? []).map((rm) => ({
      code: rm.code,
      description: rm.description,
      percentage: Number(rm.percentage),
    })),
  };

  const response = await apiClient.put(
    `${endpoint}/${encodeURIComponent(sfg)}`,
    payload
  );

  return response.data;
};

export default updateFormulation;
 
import apiClient from "../apiClient";

export const createUser = async ({
  username,
  email,
  password,
  profileImage,
  roleIds,
}) => {
  const formData = new FormData();

  formData.append(
    "Username",
    username
  );

  formData.append(
    "Email",
    email
  );

  formData.append(
    "Password",
    password
  );

  if (profileImage) {
    formData.append(
      "ProfileImage",
      profileImage
    );
  }

  roleIds.forEach((roleId) => {
    formData.append(
      "RoleIds",
      roleId
    );
  });

  const response = await apiClient.post(
    "/Users",
    formData
  );

  return response.data;
};

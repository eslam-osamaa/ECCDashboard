
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserForm from "../../components/UserForm/UserForm";
import Spinner from "../../components/Common/Spinner";

import { useToast } from "../../context/ToastContext";

import { getUserById } from "../../services/users/getUserByIdApi";
import { updateUser } from "../../services/users/updateUserApi";
import { getRoles } from "../../services/rolesApi";
import { getCurrentUser } from "../../services/authApi";

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ==========================================
  // USER DATA
  // ==========================================

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  const [roles, setRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  const [isActive, setIsActive] = useState(true);
  const [isTargetAdministrator, setIsTargetAdministrator] = useState(false);

  // ==========================================
  // CURRENT USER PERMISSIONS
  // ==========================================

  const [currentUser, setCurrentUser] = useState(null);
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);

  const currentUserRoles = Array.isArray(currentUser?.roles)
    ? currentUser.roles.map((role) =>
        String(role).trim().toLowerCase()
      )
    : [];

  const canAssignProtectedRoles =
    currentUserRoles.includes("administrator");

  const isUserManagement =
    currentUserRoles.includes("user management");

  const disabledRoleNames =
    !canAssignProtectedRoles && isUserManagement
      ? ["Administrator", "User Management"]
      : [];

  // ==========================================
  // PAGE STATE
  // ==========================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ==========================================
  // LOAD CURRENT USER
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser();

        if (isMounted) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Failed to load current user:", error);

        if (isMounted) {
          showToast(
            "error",
            "Failed to verify your permissions."
          );
        }
      } finally {
        if (isMounted) {
          setLoadingCurrentUser(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // ==========================================
  // LOAD USER
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        setLoading(true);

        const user = await getUserById(id);

        if (!isMounted) {
          return;
        }

        setUsername(user.username || "");
        setEmail(user.email || "");
        setPassword("");
        setIsActive(user.isActive ?? true);

        const userRoles = user.roles || [];

        const administratorRole = userRoles.find(
          (role) => role.name === "Administrator"
        );

        setIsTargetAdministrator(Boolean(administratorRole));

        setSelectedRoleIds(
          userRoles.map((role) => role.id)
        );

        if (user.profileImage) {
          const apiBaseUrl = (
            import.meta.env.VITE_API_URL || ""
          ).replace(/\/api\/?$/, "");

          const imageUrl = user.profileImage.startsWith("http")
            ? user.profileImage
            : `${apiBaseUrl}${user.profileImage}`;

          setProfilePreview(imageUrl);
        } else {
          setProfilePreview("");
        }
      } catch (error) {
        console.error(error);

        if (!isMounted) {
          return;
        }

        if (error.response?.status === 401) {
          showToast(
            "error",
            "You are not authorized to view this user."
          );
        } else if (error.response?.status === 403) {
          showToast(
            "error",
            "You do not have permission to edit this user."
          );
        } else if (error.response?.status === 404) {
          showToast("error", "User not found.");
        } else {
          showToast("error", "Failed to load user.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [id, showToast]);

  // ==========================================
  // LOAD ROLES
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      try {
        const data = await getRoles({
          page: 1,
          pageSize: 100,
        });

        if (isMounted) {
          // Keep ALL roles available.
          // RoleSelector will disable protected roles
          // for users without Administrator permission.
          setRoles(data.items || []);
        }
      } catch (error) {
        console.error("Failed to load roles:", error);

        if (isMounted) {
          showToast("error", "Failed to load roles.");
        }
      }
    };

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // ==========================================
  // PROFILE IMAGE
  // ==========================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showToast(
        "error",
        "Only JPG, PNG and WebP images are allowed."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast(
        "error",
        "Profile image cannot exceed 5 MB."
      );

      event.target.value = "";
      return;
    }

    setProfileImage(file);

    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);
  };

  // ==========================================
  // ROLE SELECTION
  // ==========================================

  const handleRoleChange = (roleId) => {
    const selectedRole = roles.find(
      (role) => Number(role.id) === Number(roleId)
    );

    if (!selectedRole) {
      return;
    }

    const roleName = selectedRole.name
      ?.trim()
      .toLowerCase();

    const isProtectedRole = [
      "administrator",
      "user management",
    ].includes(roleName);

    // User Management cannot change protected roles.
    if (isProtectedRole && !canAssignProtectedRoles) {
      return;
    }

    setSelectedRoleIds((currentRoleIds) => {
      const alreadySelected = currentRoleIds.some(
        (currentId) => Number(currentId) === Number(roleId)
      );

      if (alreadySelected) {
        return currentRoleIds.filter(
          (currentId) => Number(currentId) !== Number(roleId)
        );
      }

      return [...currentRoleIds, roleId];
    });
  };

  // ==========================================
  // STATUS
  // ==========================================

  const handleStatusChange = () => {
    if (isTargetAdministrator) {
      return;
    }

    setIsActive((current) => !current);
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username.trim()) {
      showToast("error", "Username is required.");
      return;
    }

    if (!email.trim()) {
      showToast("error", "Email is required.");
      return;
    }

    if (!currentUser) {
      showToast(
        "error",
        "Failed to verify your permissions."
      );
      return;
    }

    if (!canAssignProtectedRoles && !isUserManagement) {
      showToast(
        "error",
        "You do not have permission to edit users."
      );
      return;
    }

    if (isTargetAdministrator && !isActive) {
      showToast(
        "error",
        "Administrator accounts cannot be deactivated."
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("Username", username.trim());
      formData.append("Email", email.trim());

      if (password.trim()) {
        formData.append("Password", password);
      }

      formData.append(
        "IsActive",
        String(isTargetAdministrator ? true : isActive)
      );

      // For User Management, preserve any existing protected
      // role assignments. The backend enforces the same rule.
      let roleIdsToSubmit = [...selectedRoleIds];

      if (!canAssignProtectedRoles) {
        const originalUser = await getUserById(id);
        const originalRoles = originalUser.roles || [];

        const protectedRoleIds = originalRoles
          .filter((role) =>
            ["administrator", "user management"].includes(
              role.name?.trim().toLowerCase()
            )
          )
          .map((role) => role.id);

        roleIdsToSubmit = [
          ...new Set([...roleIdsToSubmit, ...protectedRoleIds]),
        ];
      }

      roleIdsToSubmit.forEach((roleId) => {
        formData.append("RoleIds", String(roleId));
      });

      if (profileImage) {
        formData.append("ProfileImage", profileImage);
      }

      await updateUser(id, formData);

      setPassword("");

      showToast("success", "User updated successfully.");
      navigate("/users");
    } catch (error) {
      console.error(error);

      if (error.response?.data?.message) {
        showToast("error", error.response.data.message);
      } else if (error.response?.status === 401) {
        showToast(
          "error",
          "You are not authorized to update this user."
        );
      } else if (error.response?.status === 403) {
        showToast(
          "error",
          "You do not have permission to update this user."
        );
      } else if (error.response?.status === 404) {
        showToast("error", "User not found.");
      } else {
        showToast("error", "Failed to update user.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading || loadingCurrentUser) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <div className="flex flex-col items-center">
          <Spinner size="lg" />

          <p className="mt-4 text-sm text-[#6b7280]">
            Loading user...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div>
      {/* SAVING OVERLAY */}
      {saving && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
          <div className="flex flex-col items-center rounded-xl bg-white px-8 py-7 shadow-lg">
            <Spinner size="lg" />

            <p className="mt-4 text-sm font-semibold text-[#374151]">
              Updating user...
            </p>

            <p className="mt-1 text-xs text-[#9ca3af]">
              Please wait...
            </p>
          </div>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <UserForm
          username={username}
          email={email}
          password={password}
          onUsernameChange={(event) =>
            setUsername(event.target.value)
          }
          onEmailChange={(event) =>
            setEmail(event.target.value)
          }
          onPasswordChange={(event) =>
            setPassword(event.target.value)
          }
          profilePreview={profilePreview}
          onImageChange={handleImageChange}
          roles={roles}
          selectedRoleIds={selectedRoleIds}
          onRoleChange={handleRoleChange}
          disabledRoleNames={disabledRoleNames}
          isActive={isActive}
          onStatusChange={handleStatusChange}
          showRoles={true}
          showStatus={true}
          disableStatus={isTargetAdministrator}
          passwordPlaceholder="Leave empty to keep current password"
          disabled={saving}
        />

        {/* ACTIONS */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/users")}
            disabled={saving}
            className="rounded-lg border border-[#d1d5db] px-4 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Spinner size="sm" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditUser;


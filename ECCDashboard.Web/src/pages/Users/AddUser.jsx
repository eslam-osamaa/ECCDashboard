import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createUser } from "../../services/users/createUserApi";
import { getRoles } from "../../services/rolesApi";
import { getCurrentUser } from "../../services/authApi";

import UserForm from "../../components/UserForm/UserForm";
import Spinner from "../../components/Common/Spinner";

import { useToast } from "../../context/ToastContext";

function AddUser() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ---------------------------------------------------------
  // Form State
  // ---------------------------------------------------------

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  const [roles, setRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  // ---------------------------------------------------------
  // Current User State
  // ---------------------------------------------------------

  const [currentUser, setCurrentUser] = useState(null);
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);

  // ---------------------------------------------------------
  // UI State
  // ---------------------------------------------------------

  const [loadingRoles, setLoadingRoles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // Load Current User
  // ---------------------------------------------------------

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
          setError("Failed to verify your permissions.");
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
  }, []);

  // ---------------------------------------------------------
  // Determine Current User Roles
  // API returns roles as strings:
  // ["Administrator", "User Management"]
  // ---------------------------------------------------------

  const currentUserRoles = Array.isArray(currentUser?.roles)
    ? currentUser.roles.map((role) =>
        String(role).trim().toLowerCase()
      )
    : [];

  const isAdministrator =
    currentUserRoles.includes("administrator");

  const isUserManagement =
    currentUserRoles.includes("user management");

  // Administrator can assign every role.
  // User Management cannot assign protected roles.
  const disabledRoleNames =
    isUserManagement && !isAdministrator
      ? ["Administrator", "User Management"]
      : [];

  // ---------------------------------------------------------
  // Load Roles
  // ---------------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      try {
        setLoadingRoles(true);

        const data = await getRoles({
          page: 1,
          pageSize: 100,
        });

        if (isMounted) {
          setRoles(data.items || []);
        }
      } catch (error) {
        console.error("Failed to load roles:", error);

        if (isMounted) {
          setError("Failed to load roles.");
        }
      } finally {
        if (isMounted) {
          setLoadingRoles(false);
        }
      }
    };

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, []);

  // ---------------------------------------------------------
  // Cleanup Preview URL
  // ---------------------------------------------------------

  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  // ---------------------------------------------------------
  // Image Change
  // ---------------------------------------------------------

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

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      showToast(
        "error",
        "Profile image cannot exceed 5 MB."
      );

      event.target.value = "";
      return;
    }

    if (profilePreview) {
      URL.revokeObjectURL(profilePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setProfileImage(file);
    setProfilePreview(previewUrl);
  };

  // ---------------------------------------------------------
  // Role Change
  // ---------------------------------------------------------

  const handleRoleChange = (roleId) => {
    const selectedRole = roles.find(
      (role) => Number(role.id) === Number(roleId)
    );

    const roleName = selectedRole?.name
      ?.trim()
      .toLowerCase();

    const isProtectedRole = [
      "administrator",
      "user management",
    ].includes(roleName);

    // Block protected role changes for User Management only.
    if (
      isUserManagement &&
      !isAdministrator &&
      isProtectedRole
    ) {
      return;
    }

    setSelectedRoleIds((currentRoleIds) => {
      const alreadySelected = currentRoleIds.some(
        (id) => Number(id) === Number(roleId)
      );

      if (alreadySelected) {
        return currentRoleIds.filter(
          (id) => Number(id) !== Number(roleId)
        );
      }

      return [...currentRoleIds, roleId];
    });
  };

  // ---------------------------------------------------------
  // Validation
  // ---------------------------------------------------------

  const validateForm = () => {
    if (!username.trim()) {
      showToast("error", "Username is required.");
      return false;
    }

    if (!email.trim()) {
      showToast("error", "Email is required.");
      return false;
    }

    if (!email.includes("@")) {
      showToast(
        "error",
        "Please enter a valid email address."
      );
      return false;
    }

    if (!password.trim()) {
      showToast("error", "Password is required.");
      return false;
    }

    if (password.length < 6) {
      showToast(
        "error",
        "Password must be at least 6 characters."
      );
      return false;
    }

    return true;
  };

  // ---------------------------------------------------------
  // Submit
  // ---------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (loadingCurrentUser || loadingRoles) {
      return;
    }

    if (!currentUser) {
      setError("Failed to verify your permissions.");
      return;
    }

    if (!isAdministrator && !isUserManagement) {
      setError("You do not have permission to create users.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      await createUser({
        username: username.trim(),
        email: email.trim(),
        password,
        profileImage,
        roleIds: selectedRoleIds,
      });

      showToast("success", "User created successfully.");

      navigate("/users", {
        replace: true,
      });
    } catch (error) {
      console.error("Failed to create user:", error);

      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 409) {
        setError(
          message || "Username or email already exists."
        );
      } else if (status === 400) {
        setError(
          message || "Please check the entered information."
        );
      } else if (status === 401) {
        setError(
          "You are not authorized to create users."
        );
      } else if (status === 403) {
        setError(
          message ||
            "You do not have permission to assign these roles."
        );
      } else {
        setError(
          "Failed to create user. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // Shared Disabled State
  // ---------------------------------------------------------

  const formDisabled =
    saving || loadingRoles || loadingCurrentUser;

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <div>
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
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
          isActive={true}
          onStatusChange={() => {}}
          showRoles={true}
          showStatus={false}
          passwordPlaceholder="Enter password"
          disabled={formDisabled}
        />

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/users")}
            disabled={saving}
            className="rounded-lg border border-[#d1d5db] bg-white px-5 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={formDisabled}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Spinner size="sm" />
                Creating...
              </>
            ) : (
              "Create User"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddUser;



import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import RoleForm from "../../components/RolesForm/RoleForm";
import Spinner from "../../components/Common/Spinner";

import { useToast } from "../../context/ToastContext";

import { getRoleById } from "../../services/roles/getRoleByIdApi";
import { updateRole } from "../../services/roles/updateRoleApi";
import { getPermissions } from "../../services/permissions/getPermissionsApi";

function EditRole() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ==========================================
  // ROLE DATA
  // ==========================================

  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] =
    useState([]);

  const [isSystemRole, setIsSystemRole] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // ==========================================
  // PAGE STATE
  // ==========================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ==========================================
  // LOAD ROLE + PERMISSIONS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setLoadError(false);

        const [roleResponse, permissionsResponse] =
          await Promise.all([
            getRoleById(id),
            getPermissions(),
          ]);

        const roleResult =
          roleResponse?.data ?? roleResponse;

        const role = roleResult?.role ?? roleResult;

        const permissionsResult =
          permissionsResponse?.data ?? permissionsResponse;

        const allPermissions = Array.isArray(permissionsResult)
          ? permissionsResult
          : permissionsResult?.items ??
            permissionsResult?.permissions ??
            [];

        if (!role || role.id == null) {
          throw new Error("Invalid role response.");
        }

        if (cancelled) return;

        setName(role.name || "");
        setIsSystemRole(Boolean(role.isSystemRole));
        setPermissions(allPermissions);

        setSelectedPermissionIds(
          (role.permissions || []).map((permission) =>
            Number(permission.id)
          )
        );
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load role:", error);

        setLoadError(true);

        if (error.response?.status === 401) {
          showToast(
            "error",
            "You are not authorized to view this role."
          );
        } else if (error.response?.status === 403) {
          showToast(
            "error",
            "You do not have permission to edit this role."
          );
        } else if (error.response?.status === 404) {
          showToast("error", "Role not found.");
        } else {
          showToast("error", "Failed to load role.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ==========================================
  // PERMISSION SELECTION
  // ==========================================

  const handlePermissionChange = (permissionId) => {
    const normalizedId = Number(permissionId);

    setSelectedPermissionIds((currentIds) => {
      if (currentIds.includes(normalizedId)) {
        return currentIds.filter(
          (currentId) => currentId !== normalizedId
        );
      }

      return [...currentIds, normalizedId];
    });
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSystemRole) {
      showToast("error", "System roles cannot be modified.");
      return;
    }

    if (!name.trim()) {
      showToast("error", "Role name is required.");
      return;
    }

    const saveStartedAt = Date.now();

    try {
      setSaving(true);

      await updateRole(id, {
        name: name.trim(),
        permissionIds: selectedPermissionIds,
      });

      // Keep the loading overlay visible briefly,
      // matching the Edit User experience.
      const elapsedTime = Date.now() - saveStartedAt;
      const remainingTime = Math.max(800 - elapsedTime, 0);

      await new Promise((resolve) =>
        setTimeout(resolve, remainingTime)
      );

      showToast("success", "Role updated successfully.");

      navigate("/roles");
    } catch (error) {
      console.error("Failed to update role:", error);

      if (error.response?.data?.message) {
        showToast("error", error.response.data.message);
      } else if (error.response?.status === 401) {
        showToast(
          "error",
          "You are not authorized to update this role."
        );
      } else if (error.response?.status === 403) {
        showToast(
          "error",
          "You do not have permission to update this role."
        );
      } else if (error.response?.status === 404) {
        showToast("error", "Role not found.");
      } else {
        showToast("error", "Failed to update role.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <div className="flex flex-col items-center">
          <Spinner size="lg" />

          <p className="mt-4 text-sm text-[#6b7280]">
            Loading role...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // LOAD ERROR
  // ==========================================

  if (loadError) {
    return (
      <div className="rounded-xl border border-[#e5e7eb] bg-white px-6 py-12 text-center">
        <p className="text-sm text-[#6b7280]">
          Unable to load this role.
        </p>

        <button
          type="button"
          onClick={() => navigate("/roles")}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#d1d5db] px-4 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#f3f4f6]"
        >
          <FiArrowLeft />
          Back to Roles
        </button>
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
              Updating role...
            </p>

            <p className="mt-1 text-xs text-[#9ca3af]">
              Please wait...
            </p>
          </div>
        </div>
      )}



      {/* SYSTEM ROLE NOTICE */}

      {isSystemRole && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          System roles cannot be modified.
        </div>
      )}

      {/* FORM */}

      <form onSubmit={handleSubmit}>
        <RoleForm
          name={name}
          onNameChange={setName}
          permissions={permissions}
          selectedPermissionIds={selectedPermissionIds}
          onPermissionChange={handlePermissionChange}
          disabled={saving || isSystemRole}
        />

        {/* ACTIONS */}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/roles")}
            disabled={saving}
            className="rounded-lg border border-[#d1d5db] px-4 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          {!isSystemRole && (
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Spinner size="sm" />}

              {saving ? "Updating..." : "Update Role"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditRole;
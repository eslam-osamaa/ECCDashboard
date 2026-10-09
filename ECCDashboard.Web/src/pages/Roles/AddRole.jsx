import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaCheck,
  FaShieldAlt,
} from "react-icons/fa";

import { getPermissions } from "../../services/permissions/getPermissionsApi";
import { createRole } from "../../services/roles/createRoleApi";

function AddRole() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD PERMISSIONS
  // ==========================================

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPermissions({
          page: 1,
          pageSize: 100,
        });

        setPermissions(data.items || []);
      } catch (error) {
        console.error(
          "Failed to load permissions:",
          error
        );

        if (error.response?.status === 403) {
          setError(
            "You do not have permission to view permissions."
          );
        } else {
          setError(
            "Failed to load permissions."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, []);

  // ==========================================
  // TOGGLE PERMISSION
  // ==========================================

  const togglePermission = (permissionId) => {
    setSelectedPermissions((current) => {
      if (current.includes(permissionId)) {
        return current.filter(
          (id) => id !== permissionId
        );
      }

      return [
        ...current,
        permissionId,
      ];
    });
  };

  // ==========================================
  // CREATE ROLE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Role name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createRole({
        name: name.trim(),
        permissionIds: selectedPermissions,
      });

      navigate("/roles");
    } catch (error) {
      console.error(
        "Failed to create role:",
        error
      );

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to create roles."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to create role."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="border-b border-[#e5e7eb] px-5 py-4">

        <div>
          <h2 className="text-base font-semibold text-[#1f2937]">
            Add Role
          </h2>

          <p className="mt-1 text-xs text-[#6b7280]">
            Create a new role and assign permissions.
          </p>
        </div>

      </div>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ==========================================
          FORM
      ========================================== */}

      <form onSubmit={handleSubmit}>

        <div className="px-5 py-5">

          {/* ==========================================
              ROLE NAME
          ========================================== */}

          <div className="max-w-xl">

            <label
              htmlFor="roleName"
              className="mb-2 block text-sm font-medium text-[#374151]"
            >
              Role Name
            </label>

            <input
              id="roleName"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter role name"
              disabled={saving}
              className="w-full rounded-lg border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#374151] outline-none transition placeholder:text-[#9ca3af] hover:border-[#9ca3af] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[#f9fafb]"
            />

          </div>

          {/* ==========================================
              PERMISSIONS
          ========================================== */}

          <div className="mt-7">

            <div className="mb-3 flex items-center justify-between">

              <div>
                <h3 className="text-sm font-semibold text-[#1f2937]">
                  Permissions
                </h3>

                <p className="mt-1 text-xs text-[#6b7280]">
                  Select the permissions for this role.
                </p>
              </div>

              <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-medium text-[#6b7280]">
                {selectedPermissions.length} selected
              </span>

            </div>

            {loading ? (
              <div className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-6 text-center text-sm text-[#6b7280]">
                Loading permissions...
              </div>
            ) : permissions.length === 0 ? (
              <div className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-6 text-center text-sm text-[#6b7280]">
                No permissions available.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {permissions.map(
                  (permission) => {

                    const isSelected =
                      selectedPermissions.includes(
                        permission.id
                      );

                    return (
                      <button
                        key={permission.id}
                        type="button"
                        onClick={() =>
                          togglePermission(
                            permission.id
                          )
                        }
                        disabled={saving}
                        className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                          isSelected
                            ? "border-[#93c5fd] bg-[#eff6ff]"
                            : "border-[#e5e7eb] bg-white hover:border-[#d1d5db] hover:bg-[#fafafa]"
                        } ${
                          saving
                            ? "cursor-not-allowed opacity-60"
                            : ""
                        }`}
                      >

                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-[#dbeafe] text-[#2563eb]"
                              : "bg-[#f3f4f6] text-[#6b7280]"
                          }`}
                        >
                          {isSelected ? (
                            <FaCheck className="text-xs" />
                          ) : (
                            <FaShieldAlt className="text-xs" />
                          )}
                        </div>

                        <span
                          className={`text-sm font-medium ${
                            isSelected
                              ? "text-[#1d4ed8]"
                              : "text-[#374151]"
                          }`}
                        >
                          {permission.name}
                        </span>

                      </button>
                    );
                  }
                )}

              </div>
            )}

          </div>

        </div>

        {/* ==========================================
            SELECTED PERMISSIONS
        ========================================== */}

        {selectedPermissions.length > 0 && (
          <div className="border-t border-[#e5e7eb] bg-[#fafafa] px-5 py-4">

            <p className="mb-3 text-xs font-medium text-[#6b7280]">
              Selected Permissions
            </p>

            <div className="flex flex-wrap gap-2">

              {selectedPermissions.map(
                (permissionId) => {

                  const permission =
                    permissions.find(
                      (item) =>
                        item.id === permissionId
                    );

                  if (!permission) {
                    return null;
                  }

                  return (
                    <span
                      key={permission.id}
                      className="rounded-md border border-[#dbeafe] bg-white px-3 py-1.5 text-xs font-medium text-[#2563eb]"
                    >
                      {permission.name}
                    </span>
                  );
                }
              )}

            </div>

          </div>
        )}

        {/* ==========================================
            ACTIONS
        ========================================== */}

        <div className="flex items-center justify-end gap-3 border-t border-[#e5e7eb] px-5 py-4">

          <button
            type="button"
            onClick={() => navigate("/roles")}
            disabled={saving}
            className="rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Creating..."
              : "Create Role"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default AddRole;
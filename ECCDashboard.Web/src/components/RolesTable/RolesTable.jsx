
import { useState } from "react";

import {
  FiEdit2,
  FiEye,
  FiTrash2,
} from "react-icons/fi";

import RoleViewModal from "./RoleViewModal";
import PermissionsTooltip from "./PermissionsTooltip";
import DeleteRoleModal from "./DeleteRoleModal";

function RolesTable({
  roles,
  loading,
  onEdit,
  onDelete,
  deleting = false,
}) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[1400px]">
          <div className="flex items-center justify-center px-5 py-12 text-sm text-[#6b7280]">
            Loading roles...
          </div>
        </div>
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[1400px]">
          <div className="flex items-center justify-center px-5 py-12 text-sm text-[#6b7280]">
            No roles found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-[1400px] w-full border-collapse">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb] text-center">
              <th className="px-5 py-3 text-xs font-semibold text-[#6b7280]">
                Role
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-[#6b7280]">
                Permissions
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-[#6b7280]">
                Type
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-[#6b7280]">
                Created Date
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-[#6b7280]">
                Created Time
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-[#6b7280]">
                Modified Date
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-[#6b7280]">
                Modified Time
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-[#6b7280]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {roles.map((role) => {
              const permissions = role.permissions || [];

              return (
                <tr
                  key={role.id}
                  className="border-b border-[#f0f0f0] text-center transition hover:bg-[#fafafa]"
                >
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-[#374151]">
                      {role.name}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {permissions.length === 0 ? (
                      <span className="text-xs text-[#9ca3af]">
                        No permissions
                      </span>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className="rounded-md border border-[#dbeafe] bg-[#eff6ff] px-2.5 py-1 text-xs font-medium text-[#2563eb]">
                          {permissions[0].name}
                        </span>

                        {permissions.length > 1 && (
                          <PermissionsTooltip
                            permissions={permissions}
                          />
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    {role.isSystemRole ? (
                      <span className="inline-flex rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[11px] font-medium text-[#6b7280]">
                        System Role
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-[#eff6ff] px-2.5 py-1 text-[11px] font-medium text-[#2563eb]">
                        Custom Role
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-[#6b7280]">
                    {role.createdAt
                      ? new Date(role.createdAt).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-5 py-4 text-sm text-[#6b7280]">
                    {role.createdAt
                      ? new Date(role.createdAt).toLocaleTimeString()
                      : "-"}
                  </td>

                  <td className="px-5 py-4 text-sm text-[#6b7280]">
                    {role.lastModified
                      ? new Date(role.lastModified).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-5 py-4 text-sm text-[#6b7280]">
                    {role.lastModified
                      ? new Date(role.lastModified).toLocaleTimeString()
                      : "-"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        title="View Role"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d1d5db] bg-white text-[#6b7280] transition hover:border-[#93c5fd] hover:bg-[#eff6ff] hover:text-[#2563eb]"
                      >
                        <FiEye className="text-sm" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(role)}
                        title="Edit Role"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d1d5db] bg-white text-[#6b7280] transition hover:border-[#93c5fd] hover:bg-[#eff6ff] hover:text-[#2563eb]"
                      >
                        <FiEdit2 className="text-sm" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setRoleToDelete(role)}
                        disabled={role.isSystemRole || deleting}
                        title={
                          role.isSystemRole
                            ? "System roles cannot be deleted"
                            : "Delete Role"
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d1d5db] bg-white text-[#6b7280] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d1d5db] disabled:hover:bg-white disabled:hover:text-[#6b7280]"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <RoleViewModal
        role={selectedRole}
        onClose={() => setSelectedRole(null)}
      />

      <DeleteRoleModal
        role={roleToDelete}
        deleting={deleting}
        onClose={() => {
          if (!deleting) setRoleToDelete(null);
        }}
        onConfirm={async () => {
          if (!roleToDelete || deleting) return;

          const success = await onDelete(roleToDelete);

          if (success) {
            setRoleToDelete(null);
          }
        }}
      />
    </>
  );
}

export default RolesTable;
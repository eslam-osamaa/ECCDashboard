
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  FiEdit2,
  FiEye,
  FiTrash2,
} from "react-icons/fi";

import UserViewModal from "./UserViewModal";

function RolesTooltip({ roles }) {
  const [position, setPosition] = useState(null);

  const handleMouseEnter = (event) => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    setPosition({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
  };

  const handleMouseLeave = () => {
    setPosition(null);
  };

  if (!roles || roles.length <= 1) {
    return null;
  }

  return (
    <>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-default rounded-md bg-[#f3f4f6] px-2 py-1 text-xs font-medium text-[#6b7280]"
      >
        + {roles.length - 1}
      </span>

      {position &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[99999] -translate-x-1/2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-left shadow-xl"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            <div className="space-y-1">
              {roles.slice(1).map((role) => (
                <div
                  key={role.id}
                  className="whitespace-nowrap text-xs text-[#374151]"
                >
                  {role.name}
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function UsersTable({ users, loading, currentUser, onEdit, onDelete, }) {
  const [selectedUser, setSelectedUser] =
    useState(null);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleDateString(
      "en-GB"
    );
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] text-left">

          {/* ==========================================
              TABLE HEADER
          ========================================== */}

          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb] text-center">

              <th className="px-5 py-3 text-xs font-semibold uppercase text-[#6b7280]">
                User
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-[#6b7280]">
                Email
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-[#6b7280]">
                Roles
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-[#6b7280]">
                Status
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-[#6b7280]">
                Created By
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-[#6b7280]">
                Created Date
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-[#6b7280]">
                Created Time
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-[#6b7280]">
                Modified By
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-[#6b7280]">
                Modified Date
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-[#6b7280]">
                Modified Time
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase text-[#6b7280]">
                Actions
              </th>

            </tr>
          </thead>

          {/* ==========================================
              TABLE BODY
          ========================================== */}

          <tbody>

            {/* LOADING */}

            {loading && (
              <tr>
                <td
                  colSpan="11"
                  className="px-5 py-10 text-center text-sm text-[#6b7280]"
                >
                  Loading users...
                </td>
              </tr>
            )}

            {/* EMPTY */}

            {!loading &&
              users.length === 0 && (
                <tr>
                  <td
                    colSpan="11"
                    className="px-5 py-10 text-center text-sm text-[#9ca3af]"
                  >
                    No users found.
                  </td>
                </tr>
              )}

            {/* USERS */}

            {!loading &&
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[#f0f0f0] text-center transition hover:bg-[#fafafa]"
                >

                  {/* ==========================================
                      USER
                  ========================================== */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eff6ff] text-sm font-semibold text-[#2563eb]">

                        {user.profileImage ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL.replace(
                              "/api",
                              ""
                            )
                              }${user.profileImage}`}
                            alt={user.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          user.username
                            ?.charAt(0)
                            ?.toUpperCase()
                        )}

                      </div>

                      <span className="text-sm font-medium text-[#1f2937]">
                        {user.username}
                      </span>

                    </div>
                  </td>

                  {/* ==========================================
                      EMAIL
                  ========================================== */}

                  <td className="px-5 py-4 text-sm text-[#4b5563]">
                    {user.email}
                  </td>

                  {/* ==========================================
                      ROLES
                  ========================================== */}

                  <td className="px-5 py-4">

                    {user.roles?.length > 0 ? (
                      <div className="flex items-center justify-center gap-1.5">

                        {/* FIRST ROLE */}

                        <span className="rounded-md bg-[#eff6ff] px-2 py-1 text-xs font-medium text-[#2563eb]">
                          {user.roles[0].name}
                        </span>

                        {/* MORE ROLES */}

                        {user.roles.length > 1 && (
                          <RolesTooltip
                            roles={user.roles}
                          />
                        )}

                      </div>
                    ) : (
                      <span className="text-xs text-[#9ca3af]">
                        No roles
                      </span>
                    )}

                  </td>

                  {/* ==========================================
                      STATUS
                  ========================================== */}

                  <td className="px-5 py-4">

                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                        }`}
                    >
                      {user.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </td>

                  {/* ==========================================
                      CREATED BY
                  ========================================== */}

                  <td className="px-5 py-4 text-sm text-[#4b5563]">
                    {user.createdBy?.username ||
                      "-"}
                  </td>

                  {/* ==========================================
                      CREATED DATE
                  ========================================== */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#4b5563]">
                    {formatDate(
                      user.createdAt
                    )}
                  </td>

                  {/* ==========================================
                      CREATED TIME
                  ========================================== */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#4b5563]">
                    {formatTime(
                      user.createdAt
                    )}
                  </td>

                  {/* ==========================================
                      MODIFIED BY
                  ========================================== */}

                  <td className="px-5 py-4 text-sm text-[#4b5563]">
                    {user.lastModifiedBy
                      ?.username || "-"}
                  </td>

                  {/* ==========================================
                      MODIFIED DATE
                  ========================================== */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#4b5563]">
                    {formatDate(
                      user.lastModified
                    )}
                  </td>

                  {/* ==========================================
                      MODIFIED TIME
                  ========================================== */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#4b5563]">
                    {formatTime(
                      user.lastModified
                    )}
                  </td>

                  {/* ==========================================
                      ACTIONS
                  ========================================== */}

                  <td className="px-5 py-4">

                    <div className="flex items-center justify-center gap-1">

                      {/* VIEW */}

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedUser(user)
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#2563eb]"
                        title="View user"
                      >
                        <FiEye size={17} />
                      </button>

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          onEdit(user)
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#2563eb]"
                        title="Edit user"
                      >
                        <FiEdit2 size={17} />
                      </button>

                     
{/* DELETE */}
{(() => {
  const isSelf = currentUser?.id === user.id;

  // Current logged-in user's roles are strings
  const isUserManagement =
    currentUser?.roles?.includes("User Management");

  // Target user's roles are objects
  const isTargetAdministrator =
    user.roles?.some(
      (role) => role.name === "Administrator"
    );

  // User Management cannot delete Administrator
  // Nobody can delete their own account
  const deleteDisabled =
    isSelf ||
    (isUserManagement && isTargetAdministrator);

  return (
    <button
      type="button"
      onClick={() => onDelete(user)}
      disabled={deleteDisabled}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
        deleteDisabled
          ? "cursor-not-allowed text-[#d1d5db]"
          : "text-[#6b7280] hover:bg-red-50 hover:text-red-600"
      }`}
      title={
        isSelf
          ? "You cannot delete your own account"
          : isUserManagement && isTargetAdministrator
          ? "User Management cannot delete Administrator accounts"
          : "Delete user"
      }
    >
      <FiTrash2 size={17} />
    </button>
  );
})()}


                    </div>

                  </td>

                </tr>
              ))}

          </tbody>

        </table>
      </div>

      {/* ==========================================
          VIEW USER MODAL
      ========================================== */}

      <UserViewModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        formatDate={formatDate}
        formatTime={formatTime}
      />
    </>
  );
}

export default UsersTable;



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getUsers } from "../../services/users/getUsersApi";
import { getRoles } from "../../services/rolesApi";
import { deleteUser } from "../../services/users/deleteUserApi";
import { getCurrentUser } from "../../services/authApi";

import UsersFilters from "../../components/UsersTable/UsersFilters";
import UsersTable from "../../components/UsersTable/UsersTable";
import UsersPagination from "../../components/UsersTable/UsersPagination";
import DeleteUserModal from "../../components/UsersTable/DeleteUserModal";

import { useToast } from "../../context/ToastContext";

function Users() {
  // ==========================================
  // NAVIGATION
  // ==========================================

  const navigate = useNavigate();

  const { showToast } = useToast();

  // ==========================================
  // STATE
  // ==========================================

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("");

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  const [totalCount, setTotalCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [userToDelete, setUserToDelete] =
    useState(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  // ==========================================
  // LOAD CURRENT USER
  // ==========================================

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();

      setCurrentUser(user);
    } catch (error) {
      console.error(
        "Failed to load current user:",
        error
      );
    }
  };

  // ==========================================
  // LOAD USERS
  // ==========================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers({
        page,
        pageSize,
        search,
        roleId,
      });

      setUsers(data.items || []);

      setTotalCount(
        data.totalCount || 0
      );
    } catch (error) {
      console.error(error);

      if (
        error.response?.status === 401
      ) {
        setError(
          "You are not authorized to view users."
        );
      } else if (
        error.response?.status === 403
      ) {
        setError(
          "You do not have permission to manage users."
        );
      } else {
        setError(
          "Failed to load users."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD ROLES
  // ==========================================

  const loadRoles = async () => {
    try {
      const data = await getRoles({
        page: 1,
        pageSize: 10,
      });

      setRoles(
        data.items || []
      );
    } catch (error) {
      console.error(
        "Failed to load roles:",
        error
      );
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadCurrentUser();
    loadRoles();
  }, []);

  // ==========================================
  // LOAD USERS
  // ==========================================

  useEffect(() => {
    loadUsers();
  }, [
    page,
    pageSize,
    search,
    roleId,
  ]);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearchChange = (
    event
  ) => {
    setSearch(
      event.target.value
    );

    setPage(1);
  };

  // ==========================================
  // ROLE FILTER
  // ==========================================

  const handleRoleChange = (
    event
  ) => {
    setRoleId(
      event.target.value
    );

    setPage(1);
  };

  // ==========================================
  // PAGE SIZE
  // ==========================================

  const handlePageSizeChange = (
    event
  ) => {
    setPageSize(
      Number(event.target.value)
    );

    setPage(1);
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages =
    Math.ceil(
      totalCount / pageSize
    );

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(
        (currentPage) =>
          currentPage - 1
      );
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(
        (currentPage) =>
          currentPage + 1
      );
    }
  };

  // ==========================================
  // EDIT USER
  // ==========================================

  const handleEdit = (user) => {
    navigate(
      `/users/${user.id}/edit`
    );
  };

  // ==========================================
  // DELETE USER
  // ==========================================

  const handleDelete = (user) => {
    if (!currentUser) {
      return;
    }

    const isSelf =
      user.id === currentUser.id;

    const currentUserRoles =
      currentUser.roles || [];

    const targetUserRoles =
      user.roles || [];

    const isUserManagement =
      currentUserRoles.includes(
        "User Management"
      );

    const isTargetAdministrator =
      targetUserRoles.includes(
        "Administrator"
      );

    if (isSelf) {
      showToast(
        "error",
        "You cannot delete your own account."
      );

      return;
    }

    if (
      isUserManagement &&
      isTargetAdministrator
    ) {
      showToast(
        "error",
        "User Management cannot delete Administrator accounts."
      );

      return;
    }

    setUserToDelete(user);
  };

  // ==========================================
  // CONFIRM DELETE
  // ==========================================

  const handleConfirmDelete = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      setDeleteLoading(true);

      await deleteUser(
        userToDelete.id
      );

      setUserToDelete(null);

      showToast(
        "success",
        "User deleted successfully."
      );

      await loadUsers();
    } catch (error) {
      console.error(
        "Failed to delete user:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to delete user."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div>

      {/* ==========================================
          MAIN CARD
      ========================================== */}

      <div className="rounded-xl border border-[#e5e7eb] bg-white">

        {/* ==========================================
            CARD HEADER + FILTERS
        ========================================== */}

        <div className="border-b border-[#e5e7eb] px-5 py-4">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-base font-semibold text-[#1f2937]">
                Users
              </h2>

              <p className="mt-1 text-xs text-[#6b7280]">
                Manage users and their access.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/users/add")
              }
              className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1d4ed8]"
            >
              Add User
            </button>

          </div>

          <UsersFilters
            search={search}
            onSearchChange={
              handleSearchChange
            }
            roleId={roleId}
            onRoleChange={
              handleRoleChange
            }
            roles={roles}
          />

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
            USERS TABLE
        ========================================== */}

        <UsersTable
          users={users}
          loading={loading}
          currentUser={currentUser}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* ==========================================
            PAGINATION
        ========================================== */}

        <UsersPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          loading={loading}
          onPrevious={
            handlePreviousPage
          }
          onNext={handleNextPage}
        />

        {/* ==========================================
            PAGE SIZE
        ========================================== */}

        <div className="flex items-center justify-end border-t border-[#e5e7eb] px-5 py-3">

          <div className="flex items-center gap-2">

            <label
              htmlFor="pageSize"
              className="text-sm text-[#6b7280]"
            >
              Rows per page
            </label>

            <select
              id="pageSize"
              value={pageSize}
              onChange={
                handlePageSizeChange
              }
              disabled={loading}
              className="rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#374151] outline-none transition hover:border-[#9ca3af] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[#f9fafb]"
            >
              <option value={10}>
                10
              </option>

              <option value={25}>
                25
              </option>

              <option value={50}>
                50
              </option>

              <option value={100}>
                100
              </option>
            </select>

          </div>

        </div>

      </div>

      {/* ==========================================
          DELETE USER MODAL
      ========================================== */}

      <DeleteUserModal
        user={userToDelete}
        onClose={() =>
          setUserToDelete(null)
        }
        onConfirm={
          handleConfirmDelete
        }
        loading={deleteLoading}
      />

    </div>
  );
}

export default Users;


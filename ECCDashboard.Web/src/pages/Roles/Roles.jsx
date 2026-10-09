
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getRoles } from "../../services/roles/getRolesApi";
import { deleteRole } from "../../services/roles/deleteRoleApi";

import RolesTable from "../../components/RolesTable/RolesTable";
import RolesPagination from "../../components/RolesTable/RolesPagination";
import RolesFilters from "../../components/RolesTable/RolesFilters";
import { useToast } from "../../context/ToastContext";

function Roles() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [roles, setRoles] = useState([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setPage(1);
    };

    const loadRoles = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getRoles({
                page,
                pageSize,
            });

            setRoles(data.items || []);
            setTotalCount(data.totalCount || 0);
        } catch (error) {
            console.error("Failed to load roles:", error);

            if (error.response?.status === 401) {
                setError("You are not authorized to view roles.");
            } else if (error.response?.status === 403) {
                setError("You do not have permission to view roles.");
            } else {
                setError("Failed to load roles.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, [page, pageSize]);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage((currentPage) => currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage((currentPage) => currentPage + 1);
        }
    };

    const handleEdit = (role) => {
        navigate(`/roles/${role.id}/edit`);
    };

    const handleDelete = async (role) => {
        if (!role || role.isSystemRole || deleting) {
            return false;
        }

        try {
            setDeleting(true);

            await deleteRole(role.id);

            showToast("success", "Role deleted successfully.");

            // If this was the last row on the current page,
            // move back one page instead of showing an empty table.
            if (roles.length === 1 && page > 1) {
                setPage((currentPage) => currentPage - 1);
            } else {
                await loadRoles();
            }

            return true;
        } catch (error) {
            console.error("Failed to delete role:", error);

            if (error.response?.data?.message) {
                showToast("error", error.response.data.message);
            } else if (error.response?.status === 401) {
                showToast(
                    "error",
                    "You are not authorized to delete this role."
                );
            } else if (error.response?.status === 403) {
                showToast(
                    "error",
                    "You do not have permission to delete this role."
                );
            } else if (error.response?.status === 404) {
                showToast("error", "Role not found.");
            } else {
                showToast("error", "Failed to delete role.");
            }

            return false;
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <div className="rounded-xl border border-[#e5e7eb] bg-white">

                {/* Header */}
                <div className="border-b border-[#e5e7eb] px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-[#1f2937]">
                                Roles
                            </h2>

                            <p className="mt-1 text-xs text-[#6b7280]">
                                Manage roles and their permissions.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/roles/add")}
                            className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1d4ed8]"
                        >
                            Add Role
                        </button>
                    </div>

                    {/* Search Filter */}
                    <div className="mt-4">
                        <RolesFilters
                            search={search}
                            onSearchChange={handleSearchChange}
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Roles Table */}
                <RolesTable
                    roles={roles}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    deleting={deleting}
                />

                {/* Pagination */}
                <RolesPagination
                    page={page}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    totalPages={totalPages}
                    loading={loading}
                    onPrevious={handlePreviousPage}
                    onNext={handleNextPage}
                />

                {/* Page Size */}
                <div className="flex items-center justify-end border-t border-[#e5e7eb] px-5 py-3">
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="rolePageSize"
                            className="text-sm text-[#6b7280]"
                        >
                            Rows per page
                        </label>

                        <select
                            id="rolePageSize"
                            value={pageSize}
                            onChange={(event) => {
                                setPageSize(Number(event.target.value));
                                setPage(1);
                            }}
                            disabled={loading}
                            className="rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#374151] outline-none transition hover:border-[#9ca3af] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[#f9fafb]"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Roles;
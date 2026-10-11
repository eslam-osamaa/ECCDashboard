import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaChevronDown,
} from "react-icons/fa";

import ViewFormulationModal from "./ViewFormulationModal";
import formulationsService from "../../services/formulations/formulationsService";
import Toast from "../Common/Toast";
import ConfirmModal from "../Common/ConfirmModal";

// الحالات القابلة للاختيار من الجدول
const statusOptions = [
  "Still",
  "Uploading",
  "Modification",
  "Problem",
];

// كل الحالات (للألوان والعرض)
const statusStyles = {
  Still: "border-gray-200 bg-gray-50 text-gray-600",
  Uploading: "border-blue-200 bg-blue-50 text-blue-700",
  Production: "border-amber-200 bg-amber-50 text-amber-700",
  Done: "border-green-200 bg-green-50 text-green-700",
  Modification: "border-purple-200 bg-purple-50 text-purple-700",
  Problem: "border-red-200 bg-red-50 text-red-700",
};

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

function SFGTable({
  data = [],
  totalCount = data.length,
  type = "Cosmetics",
  onStatusChanged,
  onDeleted,
  page = 1,
  totalPages = 1,
  onPageChange = () => {},
  pageSize = 10,
  onPageSizeChange = () => {},
  loading = false,
}) {
  const navigate = useNavigate();

  const [selectedItem, setSelectedItem] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [savingStatus, setSavingStatus] = useState({});
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const [toast, setToast] = useState(null);

  // ✅ Delete states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (toastType, message) => {
    setToast({ type: toastType, message });
  };

  const closeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!openStatusDropdown) return;

    const handleOutsideClick = (event) => {
      if (!event.target.closest("[data-status-dropdown]")) {
        setOpenStatusDropdown(null);
        setDropdownPosition(null);
      }
    };

    const handleScroll = () => {
      setOpenStatusDropdown(null);
      setDropdownPosition(null);
    };

    const handleResize = () => {
      setOpenStatusDropdown(null);
      setDropdownPosition(null);
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [openStatusDropdown]);

  const getStatus = (item) =>
    statusUpdates[item.sfg]?.status ?? item.status ?? "Still";

  const getLastModified = (item) =>
    statusUpdates[item.sfg]?.lastModified ?? item.lastModified ?? "-";

  const handleOpenDropdown = (event, item) => {
    if (openStatusDropdown === item.sfg) {
      setOpenStatusDropdown(null);
      setDropdownPosition(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const dropdownWidth = 160;
    const dropdownHeight = statusOptions.length * 40 + 8;
    const gap = 8;

    let top = rect.bottom + gap;

    if (top + dropdownHeight > window.innerHeight - gap) {
      top = Math.max(gap, rect.top - dropdownHeight - gap);
    }

    const left = Math.min(
      Math.max(
        rect.left + rect.width / 2,
        dropdownWidth / 2 + gap
      ),
      window.innerWidth - dropdownWidth / 2 - gap
    );

    setDropdownPosition({ top, left });
    setOpenStatusDropdown(item.sfg);
  };

  const handleStatusChange = async (item, newStatus) => {
    const sfg = item.sfg;
    const currentStatus = getStatus(item);

    setOpenStatusDropdown(null);
    setDropdownPosition(null);

    if (!sfg || newStatus === currentStatus) return;

    setSavingStatus((prev) => ({
      ...prev,
      [sfg]: true,
    }));

    try {
      const result = await formulationsService.changeStatus(
        sfg,
        newStatus
      );

      const updatedStatus =
        result?.Status ?? result?.status ?? newStatus;

      const updatedLastModified =
        result?.LastModified ??
        result?.lastModified ??
        new Date().toISOString();

      setStatusUpdates((prev) => ({
        ...prev,
        [sfg]: {
          status: updatedStatus,
          lastModified: updatedLastModified,
        },
      }));

      setSelectedItem((prev) => {
        if (!prev || prev.sfg !== sfg) return prev;

        return {
          ...prev,
          status: updatedStatus,
          lastModified: updatedLastModified,
        };
      });

      onStatusChanged?.({
        ...item,
        status: updatedStatus,
        lastModified: updatedLastModified,
      });

      showToast(
        "success",
        `Status updated successfully to ${updatedStatus}.`
      );
    } catch (error) {
      const responseData = error.response?.data;

      const message =
        responseData?.message ||
        responseData?.Message ||
        responseData?.title ||
        (error.response?.status === 403
          ? "You don't have permission to perform this status change."
          : error.response?.status === 400
            ? "This status transition is not allowed."
            : "Failed to update status. Please try again.");

      showToast("error", message);
    } finally {
      setSavingStatus((prev) => ({
        ...prev,
        [sfg]: false,
      }));
    }
  };

  // ==========================================
  // DELETE HANDLERS
  // ==========================================

  const handleOpenDeleteModal = (item) => {
    setDeleteTarget(item);
  };

  const handleCloseDeleteModal = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const sfg = deleteTarget.sfg;

    setDeleting(true);

    try {
      await formulationsService.delete(sfg, type);

      showToast("success", `Formulation ${sfg} deleted successfully.`);

      // بلّغ الأب
      onDeleted?.(sfg);

      setDeleteTarget(null);
    } catch (error) {
      const responseData = error.response?.data;

      const message =
        responseData?.message ||
        responseData?.Message ||
        responseData?.title ||
        (error.response?.status === 403
          ? "You don't have permission to delete this formulation."
          : error.response?.status === 404
            ? "This formulation was not found."
            : "Failed to delete formulation. Please try again.");

      showToast("error", message);
    } finally {
      setDeleting(false);
    }
  };

  const dropdownItem = data.find(
    (item) => item.sfg === openStatusDropdown
  );

  const firstItem =
    totalCount === 0 ? 0 : (page - 1) * pageSize + 1;

  const lastItem = Math.min(page * pageSize, totalCount);

  return (
    <div>
      <Toast
        type={toast?.type ?? "success"}
        message={toast?.message}
        onClose={closeToast}
      />

      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-t-xl border border-b-0 border-[#e5e7eb] bg-white px-5 py-3">
          <span className="text-sm font-semibold text-blue-600">
            Formulations
          </span>

          <span className="rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
            {totalCount}
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/${type.toLowerCase()}/add`)}
          className="flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1d4ed8]"
        >
          <span className="text-base leading-none">+</span>
          <span>Add Formulation</span>
        </button>
      </div>

      {/* Table and Pagination */}
      <div className="overflow-hidden rounded-b-xl rounded-tr-xl border border-[#e5e7eb] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  SFG
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Parent Code
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Last Modified
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => {
                const status = getStatus(item);
                const isSaving = Boolean(savingStatus[item.sfg]);
                const isDropdownOpen =
                  openStatusDropdown === item.sfg;

                return (
                  <tr
                    key={item.sfg}
                    className="border-b border-slate-100 last:border-b-0 odd:bg-white even:bg-[#fafafa]"
                  >
                    <td className="px-6 py-1 text-center text-sm font-medium text-slate-800">
                      {item.sfg}
                    </td>

                    <td className="px-6 py-1 text-center text-sm text-slate-600">
                      {item.description}
                    </td>

                    <td className="px-6 py-1 text-center text-sm text-slate-600">
                      {item.parentCode || "-"}
                    </td>

                    <td className="px-6 py-2 text-center">
                      <div className="flex flex-col items-center">
                        <button
                          data-status-dropdown
                          type="button"
                          aria-label={`Change status for ${item.sfg}`}
                          aria-haspopup="listbox"
                          aria-expanded={isDropdownOpen}
                          disabled={isSaving}
                          onClick={(event) =>
                            handleOpenDropdown(event, item)
                          }
                          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium shadow-sm outline-none transition duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-100 disabled:cursor-wait disabled:opacity-60 ${
                            statusStyles[status] ??
                            "border-gray-200 bg-gray-50 text-gray-600"
                          }`}
                        >
                          <span className="whitespace-nowrap">
                            {status}
                          </span>

                          {isSaving ? (
                            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <FaChevronDown
                              className={`shrink-0 text-[10px] transition-transform duration-200 ${
                                isDropdownOpen ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </button>

                        {isSaving && (
                          <span className="mt-1 text-xs text-gray-400">
                            Saving...
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-1 text-center text-sm text-slate-500">
                      {formatDate(getLastModified(item))}
                    </td>

                    <td className="px-6 py-1">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          title="View"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <FaEye size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/${type.toLowerCase()}/edit/${item.sfg}`
                            )
                          }
                          title="Edit"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                        >
                          <FaEdit size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(item)}
                          title="Delete"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No formulations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-[#e5e7eb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#6b7280]">
            {totalCount === 0
              ? "No formulations"
              : `Showing ${firstItem}-${lastItem} of ${totalCount}`}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1 || loading}
              className="rounded-lg border border-[#d1d5db] px-3 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="px-2 text-sm text-[#6b7280]">
              Page {page} of {Math.max(totalPages, 1)}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || loading}
              className="rounded-lg border border-[#d1d5db] px-3 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Page Size */}
        <div className="flex items-center justify-end border-t border-[#e5e7eb] px-5 py-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="formulationsPageSize"
              className="text-sm text-[#6b7280]"
            >
              Rows per page
            </label>

            <select
              id="formulationsPageSize"
              value={pageSize}
              onChange={(event) =>
                onPageSizeChange(Number(event.target.value))
              }
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

      {/* Status Dropdown */}
      {openStatusDropdown &&
        dropdownPosition &&
        dropdownItem &&
        createPortal(
          <div
            data-status-dropdown
            role="listbox"
            aria-label="Available statuses"
            className="fixed z-[10000] w-40 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-lg"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              transform: "translateX(-50%)",
            }}
          >
            {statusOptions.map((option) => {
              const isSelected =
                option === getStatus(dropdownItem);

              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={Boolean(savingStatus[dropdownItem.sfg])}
                  onClick={() =>
                    handleStatusChange(dropdownItem, option)
                  }
                  className={`block w-full px-4 py-2.5 text-left text-sm transition duration-150 disabled:opacity-50 ${
                    isSelected
                      ? "bg-[#f3f4f6] font-semibold text-[#1f2937]"
                      : "text-[#374151] hover:bg-[#f3f4f6]"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    {option}

                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>,
          document.body
        )}

      {/* View Modal */}
      {selectedItem && (
        <ViewFormulationModal
          item={{
            ...selectedItem,
            status: getStatus(selectedItem),
            lastModified: getLastModified(selectedItem),
          }}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Formulation"
        message={
          deleteTarget
            ? `Are you sure you want to delete formulation "${deleteTarget.sfg}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="red"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
      />
    </div>
  );
}

export default SFGTable;
import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";

function DeleteUserModal({
  user,
  onClose,
  onConfirm,
  loading = false,
}) {
  useEffect(() => {
    if (!user) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [user, onClose, loading]);

  if (!user) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-6"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4">

          <div>
            <h2 className="text-base font-semibold text-[#1f2937]">
              Delete User
            </h2>

            <p className="mt-1 text-xs text-[#6b7280]">
              This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#1f2937] disabled:cursor-not-allowed disabled:opacity-50"
            title="Close"
          >
            <FiX size={18} />
          </button>

        </div>

        {/* CONTENT */}

        <div className="px-6 py-6">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <FiAlertTriangle size={21} />
            </div>

            <div className="min-w-0">

              <p className="text-sm leading-6 text-[#374151]">
                Are you sure you want to delete this
                user?
              </p>

              <div className="mt-3 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3">

                <p className="truncate text-sm font-semibold text-[#1f2937]">
                  {user.username}
                </p>

                <p className="mt-1 truncate text-xs text-[#6b7280]">
                  {user.email}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex justify-end gap-3 border-t border-[#e5e7eb] px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Deleting..."
              : "Delete User"}
          </button>

        </div>

      </div>
    </div>,
    document.body
  );
}

export default DeleteUserModal;


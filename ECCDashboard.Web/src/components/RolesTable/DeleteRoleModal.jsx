
import { FiAlertTriangle, FiTrash2, FiX } from "react-icons/fi";
import Spinner from "../Common/Spinner";

function DeleteRoleModal({
  role,
  onClose,
  onConfirm,
  deleting = false,
}) {
  if (!role) return null;

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl border border-[#e5e7eb] bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#e5e7eb] px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <FiAlertTriangle className="text-xl" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[#111827]">
                Delete Role
              </h2>

              <p className="mt-1 text-sm text-[#6b7280]">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f6] disabled:opacity-50"
          >
            <FiX />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-[#4b5563]">
            Are you sure you want to delete the role{" "}
            <span className="font-semibold text-[#111827]">
              "{role.name}"
            </span>
            ?
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#e5e7eb] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg border border-[#d1d5db] px-4 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting || role.isSystemRole}
            className="inline-flex min-w-[125px] items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Spinner size="sm" />
                Deleting...
              </>
            ) : (
              <>
                <FiTrash2 />
                Delete Role
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteRoleModal;
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import Spinner from "./Spinner";

function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonColor = "red", // "red" | "blue"
  loading = false,
  onConfirm,
  onCancel,
}) {
  // Escape key + body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onCancel?.();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const confirmClasses =
    confirmButtonColor === "blue"
      ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-200"
      : "bg-red-600 hover:bg-red-700 focus:ring-red-200";

  const iconClasses =
    confirmButtonColor === "blue"
      ? "bg-blue-50 text-blue-600"
      : "bg-red-50 text-red-600";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel?.();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start gap-4 p-6">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClasses}`}
          >
            <FaExclamationTriangle size={18} />
          </div>

          <div className="flex-1">
            <h3
              id="confirm-modal-title"
              className="text-base font-semibold text-slate-900"
            >
              {title}
            </h3>

            <p className="mt-1.5 text-sm text-slate-500">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${confirmClasses}`}
          >
            {loading && <Spinner size="sm" />}
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmModal;

import { FaEye, FaEdit, FaSave } from "react-icons/fa";
import Spinner from "../Common/Spinner";

export default function FormulationActions({
  isPreview,
  saving,
  canSave,
  validationMessage,
  onCancel,
  onPreview,
  onBackToEdit,
  onSave,
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {isPreview ? (
            <button
              type="button"
              onClick={onBackToEdit}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaEdit />
              Back to Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={onPreview}
              disabled={!canSave}
              title={!canSave ? validationMessage : "Preview formulation"}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-5 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaEye />
              Preview
            </button>
          )}

          {isPreview && (
            <button
              type="button"
              onClick={onSave}
              disabled={!canSave}
              title={!canSave ? validationMessage : "Save formulation"}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
            >
              {saving ? (
                <>
                  <Spinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Formulation
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {!canSave && !isPreview && (
        <p className="mt-3 text-right text-xs text-gray-500">
          Complete all required fields and make sure the total percentage is
          100% to enable Preview.
        </p>
      )}
    </>
  );
}
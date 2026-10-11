import { useEffect, useRef, useState } from "react";
import FormField, { FieldError } from "./FormField";

const STATUS_OPTIONS = ["Still", "Uploading"];

const selectClass =
  "w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-700 outline-none transition hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function FormulationInformation({
  formData,
  onChange,
  onBlur,
  fieldErrors,
  isEditMode = false,
}) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isStatusOpen) return;

    const handleOutsideClick = (event) => {
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target)
      ) {
        setIsStatusOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [isStatusOpen]);

  const handleStatusSelect = (value) => {
    // نحاكي event.target عشان الـ onChange يستقبل { name, value }
    onChange({
      target: {
        name: "status",
        value,
      },
    });

    setIsStatusOpen(false);
  };

  return (
    <section className="mb-6 overflow-visible rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4 md:px-6">
        <h2 className="font-semibold text-gray-900">
          Formulation Information
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Fields marked with{" "}
          <span className="text-red-500">*</span> are required.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 md:p-6">
        <FormField
          label="SFG Code"
          name="sfg"
          value={formData.sfg}
          onChange={onChange}
          onBlur={onBlur}
          error={fieldErrors.sfg}
          placeholder="e.g. SFG000123"
          required
          disabled={isEditMode}
          hint={isEditMode ? "SFG Code cannot be changed." : undefined}
        />

        <FormField
          label="Parent Code"
          name="parentCode"
          value={formData.parentCode}
          onChange={onChange}
          onBlur={onBlur}
          error={fieldErrors.parentCode}
          placeholder="Enter parent code (optional)"
        />

        <div className="md:col-span-2">
          <FormField
            label="Description"
            name="description"
            value={formData.description}
            onChange={onChange}
            onBlur={onBlur}
            error={fieldErrors.description}
            placeholder="Enter formulation description"
            required
          />
        </div>

        {/* Status Dropdown */}
        <div ref={statusRef}>
          <label
            htmlFor="status"
            className={`mb-1.5 block text-sm font-medium ${
              isEditMode ? "text-gray-500" : "text-gray-700"
            }`}
          >
            Status <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <button
              id="status"
              type="button"
              disabled={isEditMode}
              onClick={() =>
                !isEditMode && setIsStatusOpen((prev) => !prev)
              }
              aria-haspopup="listbox"
              aria-expanded={isStatusOpen}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm outline-none transition ${
                isEditMode
                  ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
                  : fieldErrors.status
                    ? "border-red-500 bg-red-50 text-[#1f2937] hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-100"
                    : "border-[#d1d5db] bg-white text-[#1f2937] hover:border-[#9ca3af] hover:bg-[#f9fafb] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
              }`}
            >
              <span>{formData.status || "Select Status"}</span>

              <svg
                className={`h-4 w-4 transition-transform ${
                  isEditMode ? "text-gray-400" : "text-[#6b7280]"
                } ${isStatusOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isStatusOpen && !isEditMode && (
              <div
                role="listbox"
                className="absolute left-0 top-full z-[100] mt-2 w-full overflow-hidden rounded-lg border border-[#e5e7eb] bg-white py-1 shadow-lg"
              >
                {STATUS_OPTIONS.map((status) => {
                  const isSelected = status === formData.status;

                  return (
                    <button
                      key={status}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleStatusSelect(status)}
                      className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                        isSelected
                          ? "bg-[#f3f4f6] font-medium text-[#1f2937]"
                          : "text-[#374151] hover:bg-[#f3f4f6]"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <FieldError>{fieldErrors.status}</FieldError>

          <p className="mt-1.5 text-xs text-gray-500">
            {isEditMode
              ? "Status will automatically change to Modification when you edit the formulation."
              : "New formulations can only start as Still or Uploading."}
          </p>
        </div>
      </div>
    </section>
  );
}
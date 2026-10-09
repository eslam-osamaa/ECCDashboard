
import FormField, { FieldError } from "./FormField";

const STATUS_OPTIONS = ["Still", "Uploading"];

const selectClass =
  "w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-700 outline-none transition hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function FormulationInformation({
  formData,
  onChange,
  onBlur,
  fieldErrors,
}) {
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

        <div>
          <label
            htmlFor="status"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Status <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={onChange}
              onBlur={onBlur}
              className={`${selectClass} ${
                fieldErrors.status ? "border-red-500 bg-red-50" : ""
              }`}
              aria-invalid={Boolean(fieldErrors.status)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
              <svg
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <FieldError>{fieldErrors.status}</FieldError>

          <p className="mt-1.5 text-xs text-gray-500">
            New formulations can only start as Still or Uploading.
          </p>
        </div>
      </div>
    </section>
  );
}
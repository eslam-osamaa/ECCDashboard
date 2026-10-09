
import { FaPlus, FaTrash } from "react-icons/fa";
import { FieldError, inputClass } from "./FormField";

export default function RawMaterialsSection({
  rawMaterials,
  isPreview,
  totalPercentage,
  rmErrors,
  onAdd,
  onRemove,
  onChange,
  onBlur,
  onPaste,
}) {
  const totalIsValid = Math.abs(totalPercentage - 100) <= 0.0001;

  return (
    <section className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 md:px-6">
        <div>
          <h2 className="font-semibold text-gray-900">Raw Materials</h2>
          <p className="mt-1 text-xs text-gray-500">
            Enter each RM code, description, and percentage.
          </p>
        </div>

        {!isPreview && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <FaPlus size={12} />
            Add Raw Material
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <th className="w-14 border-b border-gray-200 px-4 py-3 text-center">
                #
              </th>
              <th className="border-b border-gray-200 px-4 py-3">
                RM Code <span className="text-red-500">*</span>
              </th>
              <th className="border-b border-gray-200 px-4 py-3">
                Description <span className="text-red-500">*</span>
              </th>
              <th className="w-40 border-b border-gray-200 px-4 py-3">
                Percentage (%) <span className="text-red-500">*</span>
              </th>
              {!isPreview && (
                <th className="w-16 border-b border-gray-200 px-4 py-3 text-center">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {rawMaterials.map((rm, index) => {
              const errors = rmErrors[index] || {};

              return (
                <tr key={index} className="align-top hover:bg-gray-50/70">
                  <td className="border-b border-gray-100 px-4 py-3 text-center text-gray-500">
                    {index + 1}
                  </td>

                  <td className="border-b border-gray-100 px-4 py-3">
                    {isPreview ? (
                      <span className="font-medium text-gray-800">
                        {rm.code}
                      </span>
                    ) : (
                      <>
                        <input
                          value={rm.code}
                          onChange={(e) =>
                            onChange(index, "code", e.target.value)
                          }
                          onBlur={() => onBlur(index, "code")}
                          onPaste={(e) => onPaste(e, index, "code")}
                          placeholder="RM000123"
                          aria-label={`Raw Material ${index + 1} code`}
                          aria-invalid={Boolean(errors.code)}
                          className={inputClass(Boolean(errors.code))}
                        />
                        <FieldError>{errors.code}</FieldError>
                      </>
                    )}
                  </td>

                  <td className="border-b border-gray-100 px-4 py-3">
                    {isPreview ? (
                      <span className="text-gray-700">{rm.description}</span>
                    ) : (
                      <>
                        <input
                          value={rm.description}
                          onChange={(e) =>
                            onChange(index, "description", e.target.value)
                          }
                          onBlur={() => onBlur(index, "description")}
                          onPaste={(e) => onPaste(e, index, "description")}
                          placeholder="Enter RM description"
                          aria-label={`Raw Material ${index + 1} description`}
                          aria-invalid={Boolean(errors.description)}
                          className={inputClass(Boolean(errors.description))}
                        />
                        <FieldError>{errors.description}</FieldError>
                      </>
                    )}
                  </td>

                  <td className="border-b border-gray-100 px-4 py-3">
                    {isPreview ? (
                      <span className="font-medium text-gray-800">
                        {rm.percentage}%
                      </span>
                    ) : (
                      <>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="any"
                            value={rm.percentage}
                            onChange={(e) =>
                              onChange(index, "percentage", e.target.value)
                            }
                            onBlur={() => onBlur(index, "percentage")}
                            onPaste={(e) => onPaste(e, index, "percentage")}
                            placeholder="0.00"
                            aria-label={`Raw Material ${index + 1} percentage`}
                            aria-invalid={Boolean(errors.percentage)}
                            className={`${inputClass(
                              Boolean(errors.percentage)
                            )} pr-8`}
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            %
                          </span>
                        </div>
                        <FieldError>{errors.percentage}</FieldError>
                      </>
                    )}
                  </td>

                  {!isPreview && (
                    <td className="border-b border-gray-100 px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onRemove(index)}
                        title="Remove Raw Material"
                        aria-label={`Remove Raw Material ${index + 1}`}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <FaTrash size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 md:px-6">
        <span className="text-sm font-medium text-gray-600">
          Total Percentage
        </span>

        <div className="text-right">
          <span
            className={`text-lg font-bold ${
              totalIsValid ? "text-green-600" : "text-red-600"
            }`}
          >
            {Number(totalPercentage.toFixed(4))}%
          </span>

          {!totalIsValid && (
            <p className="mt-1 text-xs text-red-600">
              Total must equal 100%.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
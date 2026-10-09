import { useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaSave,
  FaTimes,
} from "react-icons/fa";

function AddFormulationModal({ onClose }) {
  const [isPreview, setIsPreview] = useState(false);

  const [formData, setFormData] = useState({
    sfg: "",
    description: "",
    status: "Not Yet",
  });

  const [rawMaterials, setRawMaterials] = useState([
    {
      code: "",
      description: "",
      percentage: "",
    },
  ]);

  // Basic inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // RM / Description / Percentage change
  const handleRMChange = (index, field, value) => {
    setRawMaterials((prev) =>
      prev.map((rm, i) =>
        i === index
          ? {
              ...rm,
              [field]: value,
            }
          : rm
      )
    );
  };

  // Handle multiple pasted values
  const handleMultiPaste = (e, index, field) => {
    const pastedText = e.clipboardData.getData("text");

    const values = pastedText
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    // Normal paste of one value
    if (values.length <= 1) {
      return;
    }

    e.preventDefault();

    setRawMaterials((prev) => {
      const updated = [...prev];

      values.forEach((value, offset) => {
        const rowIndex = index + offset;

        // If the row does not exist, create it
        if (!updated[rowIndex]) {
          updated[rowIndex] = {
            code: "",
            description: "",
            percentage: "",
          };
        }

        updated[rowIndex] = {
          ...updated[rowIndex],
          [field]: value,
        };
      });

      return updated;
    });
  };

  // Add RM manually
  const handleAddRM = () => {
    setRawMaterials((prev) => [
      ...prev,
      {
        code: "",
        description: "",
        percentage: "",
      },
    ]);
  };

  // Delete RM
  const handleDeleteRM = (index) => {
    setRawMaterials((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // Total percentage
  const totalPercentage = rawMaterials.reduce(
    (total, rm) => total + (parseFloat(rm.percentage) || 0),
    0
  );

  // Check if percentage is valid
  const isPercentageValid = (percentage) => {
    if (percentage === "") return false;

    const value = Number(percentage);

    return Number.isFinite(value) && value > 0;
  };

  // Preview validation
  const handlePreview = () => {
    if (!formData.sfg.trim()) {
      alert("Please enter SFG.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please enter Description.");
      return;
    }

    // Check RM codes
    const hasMissingRM = rawMaterials.some(
      (rm) => !rm.code.trim()
    );

    if (hasMissingRM) {
      alert("Please enter an RM code for every row.");
      return;
    }

    // Check descriptions
    const hasMissingDescription = rawMaterials.some(
      (rm) => !rm.description.trim()
    );

    if (hasMissingDescription) {
      alert("Please enter a description for every RM.");
      return;
    }

    // Check percentages
    const hasInvalidPercentage = rawMaterials.some(
      (rm) => !isPercentageValid(rm.percentage)
    );

    if (hasInvalidPercentage) {
      alert(
        "Please enter a valid percentage greater than 0 for every RM."
      );
      return;
    }

    // Total must equal 100
    if (Math.abs(totalPercentage - 100) > 0.001) {
      alert(
        `Total Percentage must equal 100%. Current total: ${totalPercentage.toFixed(
          2
        )}%`
      );
      return;
    }

    setIsPreview(true);
  };

  // Save
  const handleSave = () => {
    const newFormulation = {
      sfg: formData.sfg,
      description: formData.description,
      status: formData.status,
      lastModified: new Date().toLocaleString(),

      rawMaterials: rawMaterials.map((rm) => ({
        code: rm.code,
        description: rm.description,
        percentage: Number(rm.percentage),
      })),
    };

    console.log("New Formulation:", newFormulation);

    // API save will be added later
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {isPreview
                ? "Formulation Preview"
                : "Add Formulation"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isPreview
                ? "Review the formulation before saving"
                : "Create a new formulation"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <FaTimes size={15} />
          </button>

        </div>

        {/* Content */}
        <div className="overflow-y-auto">

          {!isPreview ? (

            /* ================= FORM ================= */
            <div className="p-6">

              {/* Formulation Information */}
              <div className="mb-6">

                <h3 className="mb-4 text-sm font-semibold text-slate-800">
                  Formulation Information
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                  {/* SFG */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      SFG
                    </label>

                    <input
                      type="text"
                      name="sfg"
                      value={formData.sfg}
                      onChange={handleChange}
                      placeholder="Enter SFG"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Description
                    </label>

                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter description"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Status
                    </label>

                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Not Yet">
                        Not Yet
                      </option>

                      <option value="In Upload Stage">
                        In Upload Stage
                      </option>

                      <option value="Done">
                        Done
                      </option>
                    </select>
                  </div>

                </div>

              </div>

              {/* Raw Materials */}
              <div>

                <div className="mb-4 flex items-center justify-between">

                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Raw Materials
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Paste RM codes, descriptions, or percentages line by line
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddRM}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                  >
                    <FaPlus size={11} />
                    Add RM
                  </button>

                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">

                  <table className="w-full">

                    <thead className="bg-slate-50">

                      <tr className="border-b border-slate-200">

                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                          RM
                        </th>

                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Description
                        </th>

                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Percentage
                        </th>

                        <th className="w-16 px-4 py-3"></th>

                      </tr>

                    </thead>

                    <tbody>

                      {rawMaterials.map((rm, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 last:border-b-0"
                        >

                          {/* RM */}
                          <td className="px-3 py-2">

                            <input
                              type="text"
                              value={rm.code}
                              onChange={(e) =>
                                handleRMChange(
                                  index,
                                  "code",
                                  e.target.value
                                )
                              }
                              onPaste={(e) =>
                                handleMultiPaste(
                                  e,
                                  index,
                                  "code"
                                )
                              }
                              placeholder="RM000000"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                          </td>

                          {/* Description */}
                          <td className="px-3 py-2">

                            <input
                              type="text"
                              value={rm.description}
                              onChange={(e) =>
                                handleRMChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              onPaste={(e) =>
                                handleMultiPaste(
                                  e,
                                  index,
                                  "description"
                                )
                              }
                              placeholder="RM Description"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                          </td>

                          {/* Percentage */}
                          <td className="px-3 py-2">

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={rm.percentage}
                              onChange={(e) =>
                                handleRMChange(
                                  index,
                                  "percentage",
                                  e.target.value
                                )
                              }
                              onPaste={(e) =>
                                handleMultiPaste(
                                  e,
                                  index,
                                  "percentage"
                                )
                              }
                              placeholder="0.00"
                              className={`w-full rounded-lg border px-3 py-2 text-center text-sm text-slate-700 outline-none transition focus:ring-2 ${
                                rm.percentage !== "" &&
                                !isPercentageValid(
                                  rm.percentage
                                )
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                              }`}
                            />

                          </td>

                          {/* Delete */}
                          <td className="px-3 py-2 text-center">

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteRM(index)
                              }
                              disabled={
                                rawMaterials.length === 1
                              }
                              title="Delete RM"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <FaTrash size={13} />
                            </button>

                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>

                </div>

                {/* Total */}
                <div className="mt-4 flex justify-end">

                  <div
                    className={`rounded-xl px-5 py-3 ${
                      Math.abs(totalPercentage - 100) <= 0.001
                        ? "bg-green-50"
                        : "bg-red-50"
                    }`}
                  >

                    <span className="text-xs font-medium text-slate-500">
                      Total Percentage
                    </span>

                    <span
                      className={`ml-4 text-sm font-semibold ${
                        Math.abs(totalPercentage - 100) <= 0.001
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {totalPercentage.toFixed(2)}%
                    </span>

                  </div>

                </div>

              </div>

            </div>

          ) : (

            /* ================= PREVIEW ================= */
            <div className="p-6">

              {/* Basic Information */}
              <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    SFG
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formData.sfg}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Description
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {formData.description}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {formData.status}
                  </p>
                </div>

              </div>

              {/* Preview Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200">

                <table className="w-full">

                  <thead className="bg-slate-50">

                    <tr className="border-b border-slate-200">

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                        RM
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Description
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Percentage
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {rawMaterials.map((rm, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100 last:border-b-0 odd:bg-white even:bg-slate-50"
                      >

                        <td className="px-5 py-3 text-center text-sm font-medium text-slate-800">
                          {rm.code}
                        </td>

                        <td className="px-5 py-3 text-center text-sm text-slate-600">
                          {rm.description}
                        </td>

                        <td className="px-5 py-3 text-center text-sm text-slate-600">
                          {Number(rm.percentage).toFixed(2)}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

              {/* Total */}
              <div className="mt-4 flex justify-end">

                <div className="rounded-xl bg-green-50 px-5 py-3">

                  <span className="text-xs font-medium text-slate-500">
                    Total Percentage
                  </span>

                  <span className="ml-4 text-sm font-semibold text-green-600">
                    {totalPercentage.toFixed(2)}%
                  </span>

                </div>

              </div>

            </div>

          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">

          {/* Left */}
          <div>

            {isPreview && (
              <button
                type="button"
                onClick={() => setIsPreview(false)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                <FaArrowLeft size={12} />
                Back
              </button>
            )}

          </div>

          {/* Right */}
          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <FaTimes size={12} />
              Cancel
            </button>

            {!isPreview ? (

              <button
                type="button"
                onClick={handlePreview}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Preview
              </button>

            ) : (

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <FaSave size={12} />
                Save
              </button>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default AddFormulationModal;
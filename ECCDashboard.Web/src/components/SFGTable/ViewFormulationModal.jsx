import { useState } from "react";
import { FaCopy, FaCheck, FaTimes } from "react-icons/fa";

function ViewFormulationModal({ item, onClose }) {
  const [copied, setCopied] = useState(null);

  if (!item) return null;

  const handleCopyRM = async () => {
    if (!item.rawMaterials?.length) return;

    const rmText = item.rawMaterials
      .map((rm) => rm.code)
      .join("\n");

    await navigator.clipboard.writeText(rmText);

    setCopied("rm");

    setTimeout(() => {
      setCopied(null);
    }, 1500);
  };

  const handleCopyPercentage = async () => {
    if (!item.rawMaterials?.length) return;

    const percentageText = item.rawMaterials
      .map((rm) => rm.percentage)
      .join("\n");

    await navigator.clipboard.writeText(percentageText);

    setCopied("percentage");

    setTimeout(() => {
      setCopied(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Formulation Details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <FaTimes size={16} />
          </button>

        </div>

        {/* Information */}
        <div className="grid grid-cols-1 gap-5 border-b border-slate-200 p-6 md:grid-cols-2">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              SFG
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {item.sfg}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Description
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {item.description}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Status
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {item.status}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Last Modified
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {item.lastModified}
            </p>
          </div>

        </div>

        {/* Raw Materials */}
        <div className="p-6">

          <div className="max-h-80 overflow-auto rounded-xl border border-slate-200">

            <table className="w-full text-left">

              <thead className="sticky top-0 bg-slate-50">

                <tr className="border-b border-slate-200 text-center">

                  {/* RM */}
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">

                    <div className="flex items-center justify-center gap-2">

                      <span>RM</span>

                      <button
                        type="button"
                        onClick={handleCopyRM}
                        title="Copy RM"
                        className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                      >
                        {copied === "rm" ? (
                          <FaCheck size={12} />
                        ) : (
                          <FaCopy size={12} />
                        )}
                      </button>

                    </div>

                  </th>

                  {/* Description */}
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </th>

                  {/* Percentage */}
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">

                    <div className="flex items-center justify-center gap-2">

                      <span>Percentage</span>

                      <button
                        type="button"
                        onClick={handleCopyPercentage}
                        title="Copy Percentage"
                        className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                      >
                        {copied === "percentage" ? (
                          <FaCheck size={12} />
                        ) : (
                          <FaCopy size={12} />
                        )}
                      </button>

                    </div>

                  </th>

                </tr>

              </thead>

              <tbody>

                {item.rawMaterials?.map((rm, index) => (
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
                      {rm.percentage}
                    </td>

                  </tr>
                ))}

                {!item.rawMaterials?.length && (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-5 py-8 text-center text-sm text-slate-500"
                    >
                      No raw materials available.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

export default ViewFormulationModal;
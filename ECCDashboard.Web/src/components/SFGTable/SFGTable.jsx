
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import ViewFormulationModal from "./ViewFormulationModal";

function SFGTable({ data, totalCount = data.length, type = "Cosmetics" }) {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div>
      {/* Table Header Info */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-t-xl border border-b-0 border-[#e5e5e5] bg-white px-5 py-3">
          <span className="text-sm font-semibold text-blue-600">
            Formulations
          </span>

          <span className="rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
            {totalCount}
          </span>
        </div>

        {/* Add Formulation */}
{/* Add Formulation */}
<button
  type="button"
  onClick={() =>
    navigate(
      `/${type.toLowerCase()}/add`
    )
  }
  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
>
  <span className="text-base leading-none">+</span>
  <span>Add Formulation</span>
</button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-b-2xl rounded-tr-2xl border border-[#e5e5e5] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
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
              {data.map((item) => (
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

                  <td className="px-6 py-1 text-center text-sm text-slate-600">
                    {item.status}
                  </td>

                  <td className="px-6 py-1 text-center text-sm text-slate-500">
                    {item.lastModified}
                  </td>

                  {/* Actions */}
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
                        title="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                      >
                        <FaEdit size={14} />
                      </button>

                      <button
                        type="button"
                        title="Delete"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

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
      </div>

      {/* View Modal */}
      {selectedItem && (
        <ViewFormulationModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export default SFGTable;


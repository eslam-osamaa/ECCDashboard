
import { useState } from "react";
import {
  FaChevronUp,
  FaChevronDown,
  FaSearch,
} from "react-icons/fa";

function SFGFilters({
  search,
  setSearch,
  status,
  setStatus,
  parentCode,
  setParentCode,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Temporary filter values
  const [tempSearch, setTempSearch] = useState(search);
  const [tempParentCode, setTempParentCode] = useState(
    parentCode ?? ""
  );
  const [tempStatus, setTempStatus] = useState(status);

  const handleApply = () => {
    setSearch(tempSearch);
    setParentCode(tempParentCode);
    setStatus(tempStatus);
  };

  const handleClear = () => {
    setTempSearch("");
    setTempParentCode("");
    setTempStatus("all");

    setSearch("");
    setParentCode("");
    setStatus("all");
  };

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Filter Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between border-b border-slate-200 px-6 py-3 text-left transition focus:outline-none"
      >
        <div>
          <h2 className="font-semibold text-slate-700">
            Filters
          </h2>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </button>

      {/* Filter Content */}
      <div
        className={`overflow-hidden transition-all duration-800 ease-in-out ${
          isOpen
            ? "max-h-[500px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* SFG */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                SFG
              </label>

              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                <input
                  type="text"
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  placeholder="Search SFG..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Parent Code */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Parent Code
              </label>

              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                <input
                  type="text"
                  value={tempParentCode}
                  onChange={(e) =>
                    setTempParentCode(e.target.value)
                  }
                  placeholder="Search parent code..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <input
                type="text"
                placeholder="Search description..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option value="all">All Status</option>
                <option value="Still">Still</option>
                <option value="Uploading">Uploading</option>
                <option value="Production">Production</option>
                <option value="Done">Done</option>
                <option value="Modification">Modification</option>
                <option value="Problem">Problem</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SFGFilters;

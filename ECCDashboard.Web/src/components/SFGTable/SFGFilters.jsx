import { useState } from "react";
import {
  FaChevronUp,
  FaChevronDown,
  FaSearch,
} from "react-icons/fa";

function SFGFilters({
  search,
  setSearch,
  description,
  setDescription,
  status,
  setStatus,
  parentCode,
  setParentCode,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Temporary filter values
  const [tempSearch, setTempSearch] = useState(search);
  const [tempDescription, setTempDescription] = useState(description ?? "");
  const [tempParentCode, setTempParentCode] = useState(parentCode ?? "");
  const [tempStatus, setTempStatus] = useState(status);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Still", label: "Still" },
    { value: "Uploading", label: "Uploading" },
    { value: "Production", label: "Production" },
    { value: "Done", label: "Done" },
    { value: "Modification", label: "Modification" },
    { value: "Problem", label: "Problem" },
  ];

  const selectedStatus = statusOptions.find(
    (option) => option.value === tempStatus
  );

  const handleStatusSelect = (value) => {
    setTempStatus(value);
    setIsStatusOpen(false);
  };

  const handleApply = () => {
    setSearch(tempSearch);
    setDescription(tempDescription);
    setParentCode(tempParentCode);
    setStatus(tempStatus);
    setIsStatusOpen(false);
  };

  const handleClear = () => {
    setTempSearch("");
    setTempDescription("");
    setTempParentCode("");
    setTempStatus("all");
    setIsStatusOpen(false);

    setSearch("");
    setDescription("");
    setParentCode("");
    setStatus("all");
  };

  return (
    <div className="relative z-20 mb-6 rounded-2xl border border-slate-200 bg-white">
      {/* Filter Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between border-b border-slate-200 px-6 py-3 text-left transition focus:outline-none"
      >
        <h2 className="font-semibold text-slate-700">
          Filters
        </h2>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </button>

      {/* Filter Content */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen
            ? "max-h-[1000px] overflow-visible opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
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

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                <input
                  type="text"
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  placeholder="Search description..."
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

            {/* Status Dropdown */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setIsStatusOpen(!isStatusOpen)
                  }
                  className="flex w-full items-center justify-between rounded-lg border border-[#d1d5db] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition hover:border-[#9ca3af] hover:bg-[#f9fafb] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
                >
                  <span>
                    {selectedStatus?.label || "All Status"}
                  </span>

                  <svg
                    className={`h-4 w-4 text-[#6b7280] transition-transform ${
                      isStatusOpen ? "rotate-180" : ""
                    }`}
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

                {isStatusOpen && (
                  <div className="absolute left-0 top-full z-[100] mt-2 w-full overflow-hidden rounded-lg border border-[#e5e7eb] bg-white py-1 shadow-lg">
                    {statusOptions.map((option) => {
                      const isSelected =
                        option.value === tempStatus;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            handleStatusSelect(option.value)
                          }
                          className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                            isSelected
                              ? "bg-[#f3f4f6] font-medium text-[#1f2937]"
                              : "text-[#374151] hover:bg-[#f3f4f6]"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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
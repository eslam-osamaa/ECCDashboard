
import { useState } from "react";

function UsersFilters({
  search,
  onSearchChange,
  roleId,
  onRoleChange,
  roles,
}) {
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const selectedRole = roles.find(
    (role) => String(role.id) === String(roleId)
  );

  const handleRoleSelect = (value) => {
    onRoleChange({
      target: {
        value,
      },
    });

    setIsRoleOpen(false);
  };

  return (
    <div className="mt-5 flex flex-col gap-3 md:flex-row">
      {/* Search */}
      <div className="flex-1">
        <input
          type="text"
          value={search}
          onChange={onSearchChange}
          placeholder="Search by username or email..."
          className="w-full rounded-lg border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#1f2937] outline-none transition placeholder:text-[#9ca3af] hover:border-[#9ca3af] hover:bg-[#f9fafb] focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Role Filter */}
      <div className="relative w-full md:w-64">
        <button
          type="button"
          onClick={() => setIsRoleOpen(!isRoleOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#1f2937] outline-none transition hover:border-[#9ca3af] hover:bg-[#f9fafb] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
        >
          <span>
            {selectedRole?.name || "All Roles"}
          </span>

          <svg
            className={`h-4 w-4 text-[#6b7280] transition-transform ${
              isRoleOpen ? "rotate-180" : ""
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

        {isRoleOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-lg border border-[#e5e7eb] bg-white py-1 shadow-lg">
            {/* All Roles */}
            <button
              type="button"
              onClick={() => handleRoleSelect("")}
              className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                roleId === ""
                  ? "bg-[#f3f4f6] font-medium text-[#1f2937]"
                  : "text-[#374151] hover:bg-[#f3f4f6]"
              }`}
            >
              All Roles
            </button>

            {/* Roles */}
            {roles.map((role) => {
              const isSelected =
                String(role.id) === String(roleId);

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() =>
                    handleRoleSelect(String(role.id))
                  }
                  className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                    isSelected
                      ? "bg-[#f3f4f6] font-medium text-[#1f2937]"
                      : "text-[#374151] hover:bg-[#f3f4f6]"
                  }`}
                >
                  {role.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersFilters;


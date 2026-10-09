function RolesFilters({
  search,
  onSearchChange,
}) {
  return (
    <div className="mt-4">

      <div className="">

        <input
          id="roleSearch"
          type="text"
          value={search}
          onChange={onSearchChange}
          placeholder="Search role..."
          className="w-full rounded-lg border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#374151] outline-none transition placeholder:text-[#9ca3af] hover:border-[#9ca3af] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
        />

      </div>

    </div>
  );
}

export default RolesFilters;
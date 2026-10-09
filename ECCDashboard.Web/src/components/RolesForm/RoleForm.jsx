
function RoleForm({
  name,
  onNameChange,
  permissions = [],
  selectedPermissionIds = [],
  onPermissionChange,
  disabled = false,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
      {/* HEADER */}
      <div className="border-b border-[#e5e7eb] px-6 py-5">
        <h2 className="text-base font-semibold text-[#1f2937]">
          Role Information
        </h2>

        <p className="mt-1 text-xs text-[#6b7280]">
          Update the role name and manage its permissions.
        </p>
      </div>

      <div className="space-y-6 px-6 py-6">
        {/* ROLE NAME */}
        <div>
          <label
            htmlFor="roleName"
            className="mb-2 block text-sm font-medium text-[#374151]"
          >
            Role Name
          </label>

          <input
            id="roleName"
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            disabled={disabled}
            required
            maxLength={100}
            placeholder="Enter role name"
            className="w-full rounded-lg border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#1f2937] outline-none transition hover:border-[#9ca3af] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[#f9fafb]"
          />
        </div>

        {/* PERMISSIONS */}
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#374151]">
                Permissions
              </h3>

              <p className="mt-1 text-xs text-[#6b7280]">
                Select all permissions assigned to this role.
              </p>
            </div>

            <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-medium text-[#2563eb]">
              {selectedPermissionIds.length} selected
            </span>
          </div>

          {permissions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#d1d5db] px-4 py-8 text-center text-sm text-[#6b7280]">
              No permissions available.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {permissions.map((permission) => {
                const checked = selectedPermissionIds.some(
                  (id) => Number(id) === Number(permission.id)
                );

                return (
                  <label
                    key={permission.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                      checked
                        ? "border-[#93c5fd] bg-[#eff6ff]"
                        : "border-[#e5e7eb] bg-white hover:border-[#d1d5db] hover:bg-[#fafafa]"
                    } ${
                      disabled
                        ? "cursor-not-allowed opacity-60"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => onPermissionChange(permission.id)}
                      className="mt-0.5 h-4 w-4 accent-[#2563eb]"
                    />

                    <span className="text-sm font-medium text-[#374151]">
                      {permission.name}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoleForm;
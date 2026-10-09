
function RoleSelector({
  roles = [],
  selectedRoleIds = [],
  onRoleChange,
  disabled = false,
  disabledRoleNames = [],
}) {
  return (
    <div className="border-t border-[#e5e7eb] px-6 py-5">
      <h2 className="text-base font-semibold text-[#1f2937]">
        Roles
      </h2>

      <p className="mt-1 text-xs text-[#6b7280]">
        Select the roles assigned to this user.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => {
          const selected = selectedRoleIds.includes(role.id);

          const roleIsDisabled =
            disabled ||
            disabledRoleNames.some(
              (name) =>
                name.toLowerCase() ===
                role.name?.toLowerCase()
            );

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onRoleChange(role.id)}
              disabled={roleIsDisabled}
              title={
                roleIsDisabled && !disabled
                  ? "You do not have permission to assign this role."
                  : undefined
              }
              className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                selected
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-[#e5e7eb] bg-white text-[#374151] hover:bg-[#f9fafb]"
              } ${
                roleIsDisabled
                  ? "cursor-not-allowed opacity-50 hover:bg-white"
                  : "cursor-pointer"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  {role.name}
                </span>

                {selected && (
                  <span className="text-xs font-semibold">
                    Selected
                  </span>
                )}
              </div>

              {roleIsDisabled && !disabled && (
                <p className="mt-1 text-xs">
                  Restricted
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RoleSelector;


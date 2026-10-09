function UserStatusToggle({
  isActive = true,
  onStatusChange,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#374151]">
        Status
      </label>

      <button
        type="button"
        onClick={onStatusChange}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition ${
          disabled
            ? "cursor-not-allowed border-[#e5e7eb] bg-[#f9fafb] text-[#9ca3af]"
            : isActive
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}
      >
        <span>
          {isActive ? "Active" : "Inactive"}
        </span>

        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isActive
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        />
      </button>

      {disabled && (
        <p className="mt-2 text-xs text-[#9ca3af]">
          Administrator accounts cannot be deactivated.
        </p>
      )}
    </div>
  );
}

export default UserStatusToggle;
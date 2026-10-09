
import {
  FaShieldAlt,
  FaTimes,
} from "react-icons/fa";

function RoleViewModal({
  role,
  onClose,
}) {
  if (!role) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl border border-[#e5e7eb] bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#1f2937]">
              Role Details
            </h2>

            <p className="mt-1 text-xs text-[#6b7280]">
              View role information and assigned permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#374151]"
            title="Close"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5">

          {/* Role Name */}
          <div>
            <p className="mb-2 text-xs font-medium text-[#6b7280]">
              Role Name
            </p>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
                <FaShieldAlt className="text-sm" />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#1f2937]">
                  {role.name}
                </p>

                {role.isSystemRole && (
                  <span className="mt-1 inline-flex rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[11px] font-medium text-[#6b7280]">
                    System Role
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-[#6b7280]">
                Permissions
              </p>

              <span className="rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[11px] font-medium text-[#6b7280]">
                {role.permissions?.length || 0}
              </span>
            </div>

            {role.permissions?.length > 0 ? (
              <div className="flex max-h-60 flex-wrap gap-2 overflow-y-auto rounded-lg border border-[#e5e7eb] bg-[#fafafa] p-4">
                {role.permissions.map(
                  (permission) => (
                    <span
                      key={permission.id}
                      className="rounded-md border border-[#dbeafe] bg-white px-3 py-1.5 text-xs font-medium text-[#2563eb]"
                    >
                      {permission.name}
                    </span>
                  )
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-6 text-center text-sm text-[#6b7280]">
                No permissions assigned.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-[#e5e7eb] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleViewModal;

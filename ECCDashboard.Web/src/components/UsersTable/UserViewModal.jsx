
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

function UserViewModal({
  user,
  onClose,
  formatDate,
  formatTime,
}) {
  useEffect(() => {
    if (!user) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [user, onClose]);

  if (!user) {
    return null;
  }

  const apiBaseUrl =
    import.meta.env.VITE_API_URL.replace(
      "/api",
      ""
    );

  const profileImageUrl = user.profileImage
    ? `${apiBaseUrl}${user.profileImage}`
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4">

          <div>
            <h2 className="text-base font-semibold text-[#1f2937]">
              User Details
            </h2>

            <p className="mt-1 text-xs text-[#6b7280]">
              View user account information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#1f2937]"
            title="Close"
          >
            <FiX size={18} />
          </button>

        </div>


        {/* PROFILE */}

        <div className="border-b border-[#e5e7eb] px-6 py-6">

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eff6ff] text-xl font-semibold text-[#2563eb]">

              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={user.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                user.username
                  ?.charAt(0)
                  ?.toUpperCase() || "U"
              )}

            </div>

            <div className="min-w-0">

              <h3 className="truncate text-lg font-semibold text-[#1f2937]">
                {user.username || "-"}
              </h3>

              <p className="mt-1 truncate text-sm text-[#6b7280]">
                {user.email || "-"}
              </p>

            </div>

            <span
              className={`ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                user.isActive
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {user.isActive
                ? "Active"
                : "Inactive"}
            </span>

          </div>

        </div>


        {/* DETAILS */}

        <div className="max-h-[60vh] overflow-y-auto px-6 py-6">

          <div className="grid gap-5 sm:grid-cols-2">

            <div>
              <p className="text-xs font-medium uppercase text-[#9ca3af]">
                Email
              </p>

              <p className="mt-1 text-sm text-[#374151]">
                {user.email || "-"}
              </p>
            </div>


            <div>
              <p className="text-xs font-medium uppercase text-[#9ca3af]">
                Status
              </p>

              <p
                className={`mt-1 text-sm font-medium ${
                  user.isActive
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {user.isActive
                  ? "Active"
                  : "Inactive"}
              </p>
            </div>


            {/* ROLES */}

            <div className="sm:col-span-2">

              <p className="text-xs font-medium uppercase text-[#9ca3af]">
                Roles
              </p>

              {user.roles?.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">

                  {user.roles.map((role) => (
                    <span
                      key={role.id}
                      className="rounded-md bg-[#eff6ff] px-2.5 py-1.5 text-xs font-medium text-[#2563eb]"
                    >
                      {role.name}
                    </span>
                  ))}

                </div>
              ) : (
                <p className="mt-1 text-sm text-[#9ca3af]">
                  No roles
                </p>
              )}

            </div>


            {/* CREATED */}

            <div>
              <p className="text-xs font-medium uppercase text-[#9ca3af]">
                Created By
              </p>

              <p className="mt-1 text-sm text-[#374151]">
                {user.createdBy?.username || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-[#9ca3af]">
                Created At
              </p>

              <p className="mt-1 text-sm text-[#374151]">
                {formatDate(user.createdAt)}{" "}
                <span className="text-[#9ca3af]">
                  {formatTime(user.createdAt)}
                </span>
              </p>
            </div>


            {/* MODIFIED */}

            <div>
              <p className="text-xs font-medium uppercase text-[#9ca3af]">
                Modified By
              </p>

              <p className="mt-1 text-sm text-[#374151]">
                {user.lastModifiedBy?.username || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-[#9ca3af]">
                Last Modified
              </p>

              <p className="mt-1 text-sm text-[#374151]">
                {formatDate(user.lastModified)}{" "}
                <span className="text-[#9ca3af]">
                  {formatTime(user.lastModified)}
                </span>
              </p>
            </div>

          </div>

        </div>


        {/* FOOTER */}

        <div className="flex justify-end border-t border-[#e5e7eb] px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb]"
          >
            Close
          </button>

        </div>

      </div>
    </div>,
    document.body
  );
}

export default UserViewModal;


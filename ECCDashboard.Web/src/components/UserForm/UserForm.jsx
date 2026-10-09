
import ProfileImageUpload from "./ProfileImageUpload";
import RoleSelector from "./RoleSelector";
import UserStatusToggle from "./UserStatusToggle";

function UserForm({
  username,
  email,
  password,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,

  profilePreview,
  onImageChange,

  roles = [],
  selectedRoleIds = [],
  onRoleChange,
  disabledRoleNames = [],

  isActive = true,
  onStatusChange,

  showRoles = true,
  showStatus = true,

  disableStatus = false,

  passwordPlaceholder = "Leave empty to keep current password",

  disabled = false,
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white">
      {/* PROFILE */}
      <div className="border-b border-[#e5e7eb] px-6 py-5">
        <h2 className="text-base font-semibold text-[#1f2937]">
          Profile
        </h2>

        <p className="mt-1 text-xs text-[#6b7280]">
          Update the user's profile information.
        </p>
      </div>

      {/* USER INFORMATION */}
      <div className="grid gap-6 px-6 py-6 md:grid-cols-[180px_1fr]">
        {/* PROFILE IMAGE */}
        <ProfileImageUpload
          username={username}
          profilePreview={profilePreview}
          onImageChange={onImageChange}
          disabled={disabled}
        />

        {/* FIELDS */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* USERNAME */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={onUsernameChange}
              disabled={disabled}
              className="w-full rounded-lg border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#1f2937] outline-none transition hover:border-[#9ca3af] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[#f9fafb]"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={onEmailChange}
              disabled={disabled}
              className="w-full rounded-lg border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#1f2937] outline-none transition hover:border-[#9ca3af] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[#f9fafb]"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={onPasswordChange}
              placeholder={passwordPlaceholder}
              disabled={disabled}
              className="w-full rounded-lg border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#1f2937] outline-none transition placeholder:text-[#9ca3af] hover:border-[#9ca3af] focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[#f9fafb]"
            />
          </div>

          {/* STATUS */}
          {showStatus && (
            <UserStatusToggle
              isActive={isActive}
              onStatusChange={onStatusChange}
              disabled={disabled || disableStatus}
            />
          )}
        </div>
      </div>

      {/* ROLES */}
      {showRoles && (
        <RoleSelector
          roles={roles}
          selectedRoleIds={selectedRoleIds}
          onRoleChange={onRoleChange}
          disabled={disabled}
          disabledRoleNames={disabledRoleNames}
        />
      )}
    </div>
  );
}

export default UserForm;

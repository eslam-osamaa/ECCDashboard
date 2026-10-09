import { FiUpload } from "react-icons/fi";

function ProfileImageUpload({
  username,
  profilePreview,
  onImageChange,
  disabled = false,
}) {
  const inputId = "profileImage";

  return (
    <div className="flex flex-col items-center">

      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#eff6ff] text-3xl font-semibold text-[#2563eb]">
        {profilePreview ? (
          <img
            src={profilePreview}
            alt={username || "User"}
            className="h-full w-full object-cover"
          />
        ) : (
          username?.charAt(0)?.toUpperCase() || "U"
        )}
      </div>

      <button
        type="button"
        onClick={() =>
          document
            .getElementById(inputId)
            ?.click()
        }
        disabled={disabled}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#d1d5db] px-3 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiUpload size={15} />
        Change Photo
      </button>

      <input
        id={inputId}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={onImageChange}
        disabled={disabled}
        className="hidden"
      />

      <p className="mt-2 text-center text-xs text-[#9ca3af]">
        JPG, PNG or WebP
      </p>

    </div>
  );
}

export default ProfileImageUpload;
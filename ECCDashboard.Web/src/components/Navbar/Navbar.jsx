
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  logout,
  getCurrentUser,
} from "../../services/authApi";

import { useToast } from "../../context/ToastContext";
import Spinner from "../Common/Spinner";

function Navbar({ isCollapsed }) {
  const navigate = useNavigate();

  const { showToast } = useToast();

  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const currentUser =
          await getCurrentUser();

        setUser(currentUser);
      } catch (error) {
        console.error(
          "Failed to load current user:",
          error
        );
      }
    };

    loadCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await logout();

      showToast(
        "success",
        "Logged out successfully."
      );

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );

      showToast(
        "error",
        "Failed to logout."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const apiBaseUrl =
    import.meta.env.VITE_API_URL.replace(
      "/api",
      ""
    );

  const profileImageUrl =
    user?.profileImage
      ? user.profileImage.startsWith("http")
        ? user.profileImage
        : `${apiBaseUrl}${user.profileImage}`
      : "";

  const initials =
    user?.username
      ?.charAt(0)
      ?.toUpperCase() || "U";

  return (
    <header
      className={`fixed right-0 top-0 z-30 h-15 border-b border-slate-200 bg-[#fafafa] transition-all duration-300 ${
        isCollapsed
          ? "left-20"
          : "left-64"
      }`}
    >
      <div className="flex h-full items-center justify-end px-8">

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {/* Notification */}
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            🔔

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* User */}
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">

            {/* Profile Image */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-semibold text-blue-600">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={user?.username || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            {/* Username */}
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.username || "ECC User"}
              </p>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Logging out...
                </span>
              ) : (
                "Logout"
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}

export default Navbar;

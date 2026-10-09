import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaFlask,
  FaPalette,
  FaUsers,
  FaUserShield,
  FaChevronLeft,
} from "react-icons/fa";

import { getCurrentUser } from "../../services/authApi";

function Sidebar({
  isCollapsed,
  setIsCollapsed,
}) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser();

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

  const roles = user?.roles || [];

  const isAdministrator =
    roles.includes("Administrator");

  const canManageUsers =
    isAdministrator ||
    roles.includes("User Management");

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: FaHome,
    },
    {
      name: "Cosmetics",
      path: "/cosmetics",
      icon: FaFlask,
    },
    {
      name: "Makeup",
      path: "/makeup",
      icon: FaPalette,
    },

    ...(canManageUsers
      ? [
          {
            name: "Users",
            path: "/users",
            icon: FaUsers,
          },
        ]
      : []),

    ...(isAdministrator
      ? [
          {
            name: "Roles",
            path: "/roles",
            icon: FaUserShield,
          },
        ]
      : []),
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
        isCollapsed
          ? "w-20"
          : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex h-15 items-center border-b border-slate-200 bg-[#fafafa] px-4">
        <div className="flex w-full items-center justify-start p-1">
          {!isCollapsed ? (
            <div>
              <p className="font-bold text-slate-900">
                ECC
              </p>

              <p className="text-xs text-slate-500">
                Management System
              </p>
            </div>
          ) : (
            <p className="font-bold text-slate-900">
              ECC
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={
                isCollapsed
                  ? item.name
                  : ""
              }
              className={({ isActive }) =>
                `flex items-center rounded-xl py-3 text-sm font-medium transition ${
                  isCollapsed
                    ? "justify-center px-3"
                    : "gap-3 px-4"
                } ${
                  isActive
                    ? "bg-[#cccccc5e] text-[#333]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon className="text-lg" />

              {!isCollapsed && (
                <span>
                  {item.name}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      {!isCollapsed && (
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">
              ECC Dashboard
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Version 1.0.0
            </p>
          </div>
        </div>
      )}

      {/* Collapse Button */}
      <button
        type="button"
        onClick={() =>
          setIsCollapsed(!isCollapsed)
        }
        className="absolute -right-4 top-15 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-xs text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
      >
        <FaChevronLeft
          className={`transition-transform duration-300 ${
            isCollapsed
              ? "rotate-180"
              : ""
          }`}
        />
      </button>
    </aside>
  );
}

export default Sidebar;
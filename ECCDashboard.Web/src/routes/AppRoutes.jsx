
import {
  Navigate,
  useRoutes,
} from "react-router-dom";

import Login from "../pages/Login/Login";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/Auth/ProtectedRoute";

import UserRoutes from "./UserRoutes";
import RoleRoutes from "./RoleRoutes";
import CosmeticsRoutes from "./CosmeticsRoutes";
import MakeupRoutes from "./MakeupRoutes";
function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">
        Dashboard
      </h2>

      <p className="mt-2 text-slate-500">
        Welcome to ECC Management System.
      </p>
    </div>
  );
}

function AppRoutes() {
  const routes = [
    {
      path: "/login",
      element: <Login />,
    },

    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <DashboardLayout />,
          children: [
            {
              path: "/dashboard",
              element: <Dashboard />,
            },

            ...UserRoutes,
            ...RoleRoutes,
            ...CosmeticsRoutes,
            ...MakeupRoutes
          ],
        },
      ],
    },

    {
      path: "/",
      element: (
        <Navigate
          to="/login"
          replace
        />
      ),
    },

    {
      path: "*",
      element: (
        <Navigate
          to="/login"
          replace
        />
      ),
    },
  ];

  return useRoutes(routes);
}

export default AppRoutes;


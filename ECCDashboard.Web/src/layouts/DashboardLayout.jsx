
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import Breadcrumbs from "../components/Breadcrumbs/Breadcrumbs";


function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (

      <div className="min-h-screen bg-[#f0f4f8]">

        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <Navbar
          isCollapsed={isCollapsed}
        />

        <main
          className={`pt-12 transition-all duration-300 ${
            isCollapsed
              ? "ml-20"
              : "ml-64"
          }`}
        >
          <div className="p-8">

            <Breadcrumbs />

            <Outlet />

          </div>
        </main>

      </div>

  );
}

export default DashboardLayout;


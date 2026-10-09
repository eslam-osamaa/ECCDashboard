import { Link, useLocation } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

function Breadcrumbs() {
const { pathname } = useLocation();

const renderBreadcrumbs = (items) => ( <div className="mb-6 rounded-2xl border border-[#e5e5e5] bg-white px-5 py-2.5"> <div className="flex items-center gap-2 text-sm">
{items.map((item, index) => {
const isLast = index === items.length - 1;

      return (
        <div
          key={`${item.label}-${index}`}
          className="flex items-center gap-2"
        >
          {index > 0 && (
            <FaChevronRight className="text-[10px] text-slate-400" />
          )}

          {item.to && !isLast ? (
            <Link
              to={item.to}
              className="text-slate-500 transition hover:text-slate-700"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={
                isLast
                  ? "font-medium text-slate-900"
                  : "text-slate-500"
              }
            >
              {item.label}
            </span>
          )}
        </div>
      );
    })}
  </div>
</div>


);

// Dashboard
if (pathname === "/dashboard") {
return renderBreadcrumbs([{ label: "Dashboard" }]);
}

// Users
if (pathname === "/users/add") {
return renderBreadcrumbs([
{ label: "Dashboard", to: "/dashboard" },
{ label: "Users", to: "/users" },
{ label: "Add User" },
]);
}

if (/^\/users\/[^/]+\/edit$/.test(pathname)) {
return renderBreadcrumbs([
{ label: "Dashboard", to: "/dashboard" },
{ label: "Users", to: "/users" },
{ label: "Edit User" },
]);
}

if (pathname === "/users") {
return renderBreadcrumbs([
{ label: "Dashboard", to: "/dashboard" },
{ label: "Users" },
]);
}

// Roles
if (pathname === "/roles/add") {
return renderBreadcrumbs([
{ label: "Dashboard", to: "/dashboard" },
{ label: "Roles", to: "/roles" },
{ label: "Add Role" },
]);
}

if (/^\/roles\/[^/]+\/edit$/.test(pathname)) {
return renderBreadcrumbs([
{ label: "Dashboard", to: "/dashboard" },
{ label: "Roles", to: "/roles" },
{ label: "Edit Role" },
]);
}

if (pathname === "/roles") {
return renderBreadcrumbs([
{ label: "Dashboard", to: "/dashboard" },
{ label: "Roles" },
]);
}

// Cosmetics & Makeup
const formulationRoutes = [
{ base: "/cosmetics", label: "Cosmetics" },
{ base: "/makeup", label: "Makeup" },
];

for (const { base, label } of formulationRoutes) {
if (pathname === base) {
return renderBreadcrumbs([
{ label: "Dashboard", to: "/dashboard" },
{ label },
]);
}


if (pathname === `${base}/add`) {
  return renderBreadcrumbs([
    { label: "Dashboard", to: "/dashboard" },
    { label, to: base },
    { label: "Add Formulation" },
  ]);
}

const detailPath = pathname.slice(base.length);
const match = detailPath.match(/^\/([^/]+)\/(edit|view)$/);

if (pathname.startsWith(`${base}/`) && match) {
  const action = match[2];

  return renderBreadcrumbs([
    { label: "Dashboard", to: "/dashboard" },
    { label, to: base },
    {
      label:
        action === "edit"
          ? "Edit Formulation"
          : "View Formulation",
    },
  ]);
}


}

// Other pages
const segments = pathname.split("/").filter(Boolean);
const currentSegment = segments[segments.length - 1] || "";

const currentLabel = currentSegment
.replace(/-/g, " ")
.replace(/\b\w/g, (char) => char.toUpperCase());

return renderBreadcrumbs([
{ label: "Dashboard", to: "/dashboard" },
{ label: currentLabel || "Page" },
]);
}

export default Breadcrumbs;

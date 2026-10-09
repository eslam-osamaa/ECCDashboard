import Roles from "../pages/Roles/Roles";
import AddRole from "../pages/Roles/AddRole";
import EditRole from "../pages/Roles/EditRole";

const RoleRoutes = [
  {
    path: "/roles",
    element: <Roles />,
  },
  {
    path: "/roles/add",
    element: <AddRole />,
  },
  {
    path: "/roles/:id/edit",
    element: <EditRole />,
  },
];

export default RoleRoutes;
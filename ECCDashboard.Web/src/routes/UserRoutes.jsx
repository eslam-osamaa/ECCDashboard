
import Users from "../pages/Users/Users";
import AddUser from "../pages/Users/AddUser";
import EditUser from "../pages/Users/EditUser";

const UserRoutes = [
  {
    path: "/users",
    element: <Users />,
  },
  {
    path: "/users/add",
    element: <AddUser />,
  },
  {
    path: "/users/:id/edit",
    element: <EditUser />,
  },
];

export default UserRoutes;


import AddMakeupFormulation from "../pages/Makeup/AddFormulation";
import Makeup from "../pages/Makeup/Makeup";
import EditMakeupFormulation from "../pages/Makeup/EditFormulation";

const MakeupRoutes = [
  {
    path: "/makeup",
    element: <Makeup />,
  },
  {
    path: "/makeup/add",
    element: <AddMakeupFormulation />,
  },
  {
    path: "/makeup/edit/:sfg",
    element: <EditMakeupFormulation />,
  },
];

export default MakeupRoutes;
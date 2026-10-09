import AddMakeupFormulation from "../pages/Makeup/AddFormulation";
import Makeup from "../pages/Makeup/Makeup";

const MakeupRoutes = [
  {
    path: "/makeup",
    element: <Makeup />,
  },
  {
    path: "/makeup/add",
    element: <AddMakeupFormulation />,
  },
];

export default MakeupRoutes;

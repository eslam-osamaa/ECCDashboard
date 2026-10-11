import Cosmetics from "../pages/Cosmetics/Cosmetics";
import AddFormulation from "../pages/Cosmetics/AddFormulation";
import EditFormulation from "../pages/Cosmetics/EditFormulation";

const CosmeticsRoutes = [
  {
    path: "/cosmetics",
    element: <Cosmetics />,
  },
  {
    path: "/cosmetics/add",
    element: <AddFormulation />,
  },
  {
    path: "/cosmetics/edit/:sfg",
    element: <EditFormulation type="Cosmetics" />,
  },
];

export default CosmeticsRoutes;
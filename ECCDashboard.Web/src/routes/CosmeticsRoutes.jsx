
import Cosmetics from "../pages/Cosmetics/Cosmetics";
import AddFormulation from "../pages/Cosmetics/AddFormulation";

const CosmeticsRoutes = [
  {
    path: "/cosmetics",
    element: <Cosmetics />,
  },
  {
    path: "/cosmetics/add",
    element: <AddFormulation />,
  },
];

export default CosmeticsRoutes;

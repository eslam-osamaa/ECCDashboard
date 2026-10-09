
import {
  BrowserRouter,
} from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";

import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;


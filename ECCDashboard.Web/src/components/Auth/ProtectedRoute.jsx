
import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

import { getCurrentUser } from "../../services/authApi";
import Spinner from "../Common/Spinner";
import { useToast } from "../../context/ToastContext";

function ProtectedRoute() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const redirectToLogin = (message) => {
      if (!isMounted) {
        return;
      }

      setIsAuthorized(false);

      showToast("error", message);

      navigate("/login", {
        replace: true,
      });
    };

    const checkAuthentication = async () => {
      try {
        const user = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        if (user?.isActive === true) {
          setIsAuthorized(true);
        } else {
          redirectToLogin(
            "Your account has been deactivated."
          );
        }
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        if (!isMounted) {
          return;
        }

        if (error.response?.status === 401) {
          redirectToLogin(
            "Your account has been deactivated."
          );
        } else {
          setIsAuthorized(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial authentication check
    checkAuthentication();

    // Check account status every 15 seconds
    const intervalId = setInterval(
      async () => {
        try {
          const user = await getCurrentUser();

          if (!isMounted) {
            return;
          }

          if (user?.isActive !== true) {
            redirectToLogin(
              "Your account has been deactivated."
            );
          }
        } catch (error) {
          if (!isMounted) {
            return;
          }

          if (error.response?.status === 401) {
            redirectToLogin(
              "Your account has been deactivated."
            );
          }
        }
      },
      15000
    );

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [navigate, showToast]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;


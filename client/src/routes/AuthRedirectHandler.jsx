import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function AuthRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthRequired = () => {
      if (location.pathname !== "/login") {
        navigate("/login", {
          state: { from: location },
        });
      }
    };

    window.addEventListener("auth:required", handleAuthRequired);

    return () => {
      window.removeEventListener("auth:required", handleAuthRequired);
    };
  }, [navigate, location]);

  return null;
}

export default AuthRedirectHandler;

import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSeo } from "@/hooks/useSeo";

import { errorLogger } from "@/services/errorLogger";

const NotFound = () => {
  const location = useLocation();

  useSeo({
    title: "Page Not Found | Jamb Crash AI",
    description: "The page you are looking for does not exist. Return to Jamb Crash AI to continue your JAMB preparation.",
    path: location.pathname,
    noindex: true,
  });

  useEffect(() => {
    errorLogger.error(`404: User attempted to access non-existent route: ${location.pathname}`, { component: 'NotFound', action: 'log 404' });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

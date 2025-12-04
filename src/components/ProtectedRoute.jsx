import React from "react";
import { getUser } from "../auth";

/*
 ProtectedRoute is a lightweight wrapper component.
 Usage:
  <ProtectedRoute>
    <SomeComponent />
  </ProtectedRoute>

 If there's no logged-in user, you can redirect or render a fallback.
 This is intentionally simple because the app currently uses setCurrentPage routing.
*/

const ProtectedRoute = ({ children, fallback = null }) => {
  const user = getUser();
  if (!user) return fallback;
  return <>{children}</>;
};

export default ProtectedRoute;

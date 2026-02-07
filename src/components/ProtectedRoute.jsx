import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { auth } = useContext(AuthContext);

  // If no token, redirect to login
  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles.length > 0) {
    // Handle both possible role claim formats from JWT
    const userRole = (
      auth.user?.role || 
      auth.user?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 
      ""
    ).toLowerCase();
    
    const hasPermission = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!hasPermission) {
      // Redirect unauthorized users to login or a forbidden page
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
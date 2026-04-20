import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, children }) => {
  // If no user is logged in, redirect them to the /login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Otherwise, let them through to the Dashboard (the children)
  return children;
};

export default ProtectedRoute;
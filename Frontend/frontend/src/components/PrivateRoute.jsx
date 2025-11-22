import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('auth');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
//PrivateRoute checks localStorage.getItem('auth') and redirects to /login if absent.
//it wraps protected routes
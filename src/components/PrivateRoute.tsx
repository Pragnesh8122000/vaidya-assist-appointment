import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import type { RootState } from '../app/store';

const PrivateRoute = () => {
  const { isAuthenticated, isGuest } = useSelector((state: RootState) => state.auth);
  const token = localStorage.getItem('token');

  // If a real token exists but auth state hasn't rehydrated yet,
  // show a loader instead of redirecting to login and causing a flash.
  // Guest mode has no token — it's memory-only, so no loading state needed.
  if (token && !isAuthenticated && !isGuest) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Both real authenticated users and guests can access protected routes.
  // Guest restrictions are handled at the route level (App.tsx) and
  // component level (e.g., RestrictionBlock for /book).
  return (isAuthenticated || isGuest) ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
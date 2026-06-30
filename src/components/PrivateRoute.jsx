import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const PrivateRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const token = localStorage.getItem('token');

  // If a token exists but the auth state hasn't been rehydrated yet,
  // show a loader instead of redirecting to login and causing a flash.
  if (token && !isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './app/store';
import { getTheme } from './theme/theme';
import { getMe } from './features/authSlice';
import MainLayout from './layouts/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import PatientChatWidget from './components/PatientChatWidget';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';


const AppRoutes = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch]);

  const theme = getTheme(darkMode ? 'dark' : 'light');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="top-right" autoClose={3000} theme={darkMode ? 'dark' : 'light'} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />

          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/book" element={<BookAppointment />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Patient chat widget — available on all authenticated pages */}
        {isAuthenticated && <PatientChatWidget />}
      </BrowserRouter>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
};

export default App;

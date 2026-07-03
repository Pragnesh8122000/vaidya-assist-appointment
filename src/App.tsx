import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from './app/store';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './app/store';
import type { RootState } from './app/store';
import { getTheme } from './theme/theme';
import { getMe } from './features/authSlice';
import MainLayout from './layouts/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import RestrictionBlock from './components/RestrictionBlock';
import PatientChatWidget from './components/PatientChatWidget';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import { GUEST_RESTRICTION_MESSAGES } from './constants/guestData';

/**
 * Component that shows restriction block for a specific restricted path.
 */
const GuestRestrictedPage = ({ path }: { path: string }) => {
  const messages = GUEST_RESTRICTION_MESSAGES[path] || GUEST_RESTRICTION_MESSAGES.default;
  return <RestrictionBlock title={messages.title} body={messages.body} />;
};

const AppRoutes = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isGuest } = useSelector((state: RootState) => state.auth);
  const { darkMode } = useSelector((state: RootState) => state.ui);
  const theme = getTheme(darkMode ? 'dark' : 'light');

  useEffect(() => {
    // Only try to rehydrate real auth sessions (has token in localStorage).
    // Guest mode is memory-only — refreshing the page clears it.
    const token = localStorage.getItem('token');
    if (token && !isGuest) {
      dispatch(getMe());
    }
  }, [dispatch, isGuest]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="top-right" autoClose={3000} theme={darkMode ? 'dark' : 'light'} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={isAuthenticated && !isGuest ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={isAuthenticated && !isGuest ? <Navigate to="/" /> : <Register />} />

          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/book"
                element={isGuest ? <GuestRestrictedPage path="/book" /> : <BookAppointment />}
              />
              <Route
                path="/settings"
                element={isGuest ? <GuestRestrictedPage path="/settings" /> : <div>Settings</div>}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>

      {/* Chatbot hidden entirely from DOM for guests */}
      {isAuthenticated && !isGuest && <PatientChatWidget />}
    </ThemeProvider>
  );
};

const App = () => (
  <Provider store={store}>
    <AppRoutes />
  </Provider>
);

export default App;
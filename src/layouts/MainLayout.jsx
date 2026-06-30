import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

import { logout } from '../features/authSlice';
import { toggleSidebar, toggleDarkMode } from '../features/uiSlice';
import Footer from '../components/Footer';

const DRAWER_WIDTH = 260;
const MINI_WIDTH = 72;

const navGroups = [
  {
    label: 'Main',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
      { text: 'Book Appointment', icon: <CalendarMonthIcon />, path: '/book' },
      { text: 'My Appointments', icon: <HistoryIcon />, path: '/appointments' },
    ],
  },
  {
    label: 'Account',
    items: [
      { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    ],
  },
];

const menuItems = navGroups.flatMap((group) => group.items);

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen, darkMode } = useSelector((state) => state.ui);
  const [userAnchor, setUserAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const drawerWidth = sidebarOpen ? DRAWER_WIDTH : MINI_WIDTH;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Wordmark + collapse toggle */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 64 }}>
        {sidebarOpen && (
          <>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MedicalServicesIcon sx={{ color: 'primary.contrastText', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} noWrap sx={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: '1.3rem', color: 'text.primary' }}>
              Vaidya Patient
            </Typography>
          </>
        )}
        {!isMobile && (
          <IconButton onClick={() => dispatch(toggleSidebar())} sx={{ ml: 'auto' }} size="small" aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
            {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        )}
      </Box>
      <Divider />

      {/* Prominent user identity at the top */}
      <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 64 }}>
        <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: 16, flexShrink: 0 }}>{user?.name?.charAt(0)}</Avatar>
        {sidebarOpen && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>{user?.name || 'Patient'}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>Patient</Typography>
          </Box>
        )}
      </Box>
      <Divider />

      {/* Grouped navigation */}
      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {navGroups.map((group) => (
          <Box key={group.label} sx={{ mb: 1.5 }}>
            {sidebarOpen && (
              <Typography variant="overline" color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block', lineHeight: 1.6, letterSpacing: 1 }}>
                {group.label}
              </Typography>
            )}
            {group.items.map((item) => (
              <Tooltip key={item.text} title={!sidebarOpen ? item.text : ''} placement="right">
                <ListItemButton
                  onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 2, mb: 0.5, minHeight: 48, px: sidebarOpen ? 2 : 1,
                    justifyContent: sidebarOpen ? 'initial' : 'center',
                    '&.Mui-selected': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(143,179,163,0.16)' : 'rgba(61,90,76,0.10)',
                      // Non-color cue: bold text + warm amber left accent bar (not color alone).
                      boxShadow: 'inset 3px 0 0 #C8862A',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                      '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 700 },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: sidebarOpen ? 40 : 0, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                  {sidebarOpen && <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14 }} />}
                </ListItemButton>
              </Tooltip>
            ))}
          </Box>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: -9999,
          top: 0,
          zIndex: 2000,
          bgcolor: 'primary.main',
          color: '#fff',
          px: 2,
          py: 1,
          fontWeight: 700,
          textDecoration: 'none',
          borderRadius: 0,
          '&:focus': { left: 8, top: 8 },
        }}
      >
        Skip to main content
      </Box>
      {isMobile ? (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer variant="permanent" sx={{
          width: drawerWidth, flexShrink: 0, transition: 'width 0.3s',
          '& .MuiDrawer-paper': { width: drawerWidth, transition: 'width 0.3s', overflowX: 'hidden', borderRight: 'none', boxShadow: (theme) => theme.palette.mode === 'dark' ? '2px 0 8px rgba(0,0,0,0.35)' : '2px 0 8px rgba(0,0,0,0.05)' }
        }}>
          {drawerContent}
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            {isMobile && <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}><MenuIcon /></IconButton>}
            <Typography variant="h6" color="text.primary" fontWeight={600} sx={{ flex: 1 }}>
              {menuItems.find(i => i.path === location.pathname)?.text || 'Vaidya Patient'}
            </Typography>

            <IconButton onClick={() => dispatch(toggleDarkMode())} sx={{ mr: 1 }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <IconButton onClick={(e) => setUserAnchor(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: 14 }}>{user?.name?.charAt(0)}</Avatar>
            </IconButton>

            <Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setUserAnchor(null); navigate('/profile'); }}><PersonIcon sx={{ mr: 1, fontSize: 18 }} />Profile</MenuItem>
              <MenuItem onClick={() => { setUserAnchor(null); navigate('/settings'); }}><SettingsIcon sx={{ mr: 1, fontSize: 18 }} />Settings</MenuItem>
              <MenuItem onClick={handleLogout}><LogoutIcon sx={{ mr: 1, fontSize: 18 }} />Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" id="main-content" tabIndex={-1} sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', p: 3, '&:focus': { outline: 'none' } }}>
          <Outlet />
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;

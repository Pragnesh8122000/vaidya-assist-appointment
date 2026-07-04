import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../app/store';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '../app/store';
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
import Chip from '@mui/material/Chip';
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
import LoginIcon from '@mui/icons-material/Login';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import Button from '@mui/material/Button';
import LockIcon from '@mui/icons-material/Lock';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { logout, exitGuestMode } from '../features/authSlice';
import { toggleSidebar, toggleDarkMode } from '../features/uiSlice';
import { openPatientChat } from '../features/patientChatSlice';
import Footer from '../components/Footer';
import RestrictionToast from '../components/RestrictionToast';
const DRAWER_WIDTH = 260;
const MINI_WIDTH = 72;

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  restricted?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const buildNavGroups = (_isGuest: boolean): NavGroup[] => [
  {
    label: 'Main',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
      { text: 'Book Appointment', icon: <CalendarMonthIcon />, path: '/book', restricted: true },
      { text: 'My Appointments', icon: <HistoryIcon />, path: '/appointments' },
    ],
  },
  {
    label: 'Account',
    items: [
      { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/settings', restricted: true },
    ],
  },
];

const MainLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isGuest } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen, darkMode } = useSelector((state: RootState) => state.ui);
  const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [restrictionToast, setRestrictionToast] = useState<string | null>(null);

  const navGroups = buildNavGroups(isGuest);
  const flatItems = navGroups.flatMap((group) => group.items);

  const handleRestrictedClick = (item: NavItem) => {
    setRestrictionToast(
      `"${item.text}" is not available in demo mode. Please create an account to use this feature.`
    );
  };

  const handleLogout = () => {
    if (isGuest) {
      dispatch(exitGuestMode());
      navigate('/login');
    } else {
      dispatch(logout());
      navigate('/login');
    }
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
            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Crimson Pro", Georgia, serif', fontSize: '1.3rem', color: 'text.primary' }} noWrap>
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
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{user?.name || 'Patient'}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{isGuest ? 'Guest' : (user?.role?.name || 'Patient')}</Typography>
          </Box>
        )}
      </Box>

      {/* Demo Mode badge for guests */}
      {isGuest && sidebarOpen && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Chip
            icon={<InfoOutlinedIcon sx={{ fontSize: '0.9rem !important' }} />}
            label="Demo Mode"
            size="small"
            sx={{
              width: '100%',
              justifyContent: 'flex-start',
              bgcolor: 'rgba(200, 134, 42, 0.12)',
              color: '#A66B20',
              fontWeight: 600,
              '& .MuiChip-icon': { color: '#C8862A' },
            }}
          />
        </Box>
      )}
      {isGuest && !sidebarOpen && (
        <Box sx={{ display: 'flex', justifyContent: 'center', px: 1, pb: 0.5 }}>
          <Tooltip title="Demo Mode" placement="right">
            <InfoOutlinedIcon sx={{ fontSize: 18, color: '#C8862A' }} />
          </Tooltip>
        </Box>
      )}
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
            {group.items.map((item) => {
              const isRestricted = isGuest && item.restricted;
              return (
                <Tooltip key={item.text} title={!sidebarOpen ? item.text : (isRestricted ? `${item.text} (requires account)` : '')} placement="right">
                  <ListItemButton
                    onClick={() => {
                      if (isRestricted) {
                        handleRestrictedClick(item);
                      } else {
                        navigate(item.path);
                      }
                      if (isMobile) setMobileOpen(false);
                    }}
                    selected={!isRestricted && location.pathname === item.path}
                    sx={{
                      borderRadius: 2, mb: 0.5, minHeight: 48, px: sidebarOpen ? 2 : 1,
                      justifyContent: sidebarOpen ? 'initial' : 'center',
                      opacity: isRestricted ? 0.6 : 1,
                      '&.Mui-selected': {
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(143,179,163,0.16)' : 'rgba(61,90,76,0.10)',
                        boxShadow: 'inset 3px 0 0 #C8862A',
                        '& .MuiListItemIcon-root': { color: 'primary.main' },
                        '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 700 },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: sidebarOpen ? 40 : 0, justifyContent: 'center' }}>
                      {isRestricted ? (
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          {item.icon}
                          <LockIcon sx={{ position: 'absolute', bottom: -4, right: -4, fontSize: 12, color: '#C8862A' }} />
                        </Box>
                      ) : item.icon}
                    </ListItemIcon>
                    {sidebarOpen && <ListItemText primary={item.text} sx={{ '& .MuiListItemText-primary': { fontSize: 14 } }} />}
                  </ListItemButton>
                </Tooltip>
              );
            })}
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
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600, flex: 1 }}>
              {flatItems.find(i => i.path === location.pathname)?.text || 'Vaidya Patient'}
            </Typography>

            <IconButton onClick={() => dispatch(toggleDarkMode())} sx={{ mr: 1 }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <Button
              variant="contained"
              size="small"
              startIcon={<MedicalServicesIcon />}
              onClick={() => dispatch(openPatientChat())}
              sx={{ mr: 1, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 1.5 }}
            >
              Assistant
            </Button>

            <IconButton onClick={(e) => setUserAnchor(e.currentTarget)}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: 14 }}>{user?.name?.charAt(0)}</Avatar>
            </IconButton>

            <Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setUserAnchor(null); navigate('/profile'); }}><PersonIcon sx={{ mr: 1, fontSize: 18 }} />Profile</MenuItem>
              <MenuItem onClick={() => { setUserAnchor(null); navigate('/settings'); }}><SettingsIcon sx={{ mr: 1, fontSize: 18 }} />Settings</MenuItem>
              <MenuItem onClick={handleLogout}>
                {isGuest ? <><LoginIcon sx={{ mr: 1, fontSize: 18 }} />Exit Demo</> : <><LogoutIcon sx={{ mr: 1, fontSize: 18 }} />Logout</>}
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" id="main-content" tabIndex={-1} sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', p: 3, '&:focus': { outline: 'none' } }}>
          <Outlet />
          <Footer />
        </Box>
      </Box>

      {/* Restriction toast for guest */}
      {restrictionToast && (
        <RestrictionToast
          message={restrictionToast}
          onClose={() => setRestrictionToast(null)}
        />
      )}
    </Box>
  );
};

export default MainLayout;
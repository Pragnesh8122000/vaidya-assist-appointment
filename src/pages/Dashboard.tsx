import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../app/store';
import type { RootState } from '../app/store';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Button from '@mui/material/Button';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { getAppointments, getPatientProfile } from '../features/patientAppointmentSlice';
import { GUEST_DASHBOARD_STATS } from '../constants/guestData';
import RestrictionToast from '../components/RestrictionToast';

interface StatItem {
  label: string;
  value: string;
  subtext: string;
  action: string;
  icon: React.ReactElement;
  path: string;
}

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isGuest } = useSelector((state: RootState) => state.auth);
  const { appointments, profile } = useSelector((state: RootState) => state.patient);
  const [restrictionToast, setRestrictionToast] = useState<string | null>(null);

  useEffect(() => {
    // Guests never trigger API calls — data comes from constants.
    if (!isGuest) {
      dispatch(getPatientProfile());
      dispatch(getAppointments({}));
    }
  }, [dispatch, isGuest]);

  const stats = useMemo<StatItem[]>(() => {
    if (isGuest) {
      const gs = GUEST_DASHBOARD_STATS;
      return [
        {
          label: 'Next Appointment',
          value: 'Jul 15, 2026',
          subtext: `with ${gs.nextAppointment.doctor} at 10:30 AM`,
          action: 'View Details',
          icon: <CalendarMonthIcon />,
          path: '/appointments',
        },
        {
          label: 'Past Visits',
          value: gs.completedCount.toString(),
          subtext: 'visits recorded',
          action: 'View Details',
          icon: <HistoryIcon />,
          path: '/appointments',
        },
        {
          label: 'Profile Status',
          value: 'Demo Mode',
          subtext: 'You are exploring in demo mode',
          action: 'View Details',
          icon: <PersonIcon />,
          path: '/profile',
        },
      ];
    }

    // Real user stats (original logic). FE-10: appointments is typed
    // `Appointment[]` via the shared store types, so no casts are needed.
    const today = dayjs().startOf('day');
    const upcoming = appointments
      .filter((apt) => !['Cancelled', 'Completed'].includes(apt.status)
        && dayjs(apt.date).startOf('day').isAfter(today.clone().subtract(1, 'day')))
      .sort((a, b) => {
        const dateDiff = dayjs(a.date).diff(dayjs(b.date), 'day');
        if (dateDiff !== 0) return dateDiff;
        return String(a.time || '').localeCompare(String(b.time || ''));
      });

    const next = upcoming[0];
    const completedCount = appointments.filter((apt) => apt.status === 'Completed').length;
    const requiredFields: string[] = ['name', 'email', 'phone'];
    const profileRec = profile as Record<string, unknown> | null;
    const filledFields = requiredFields.filter((key) => profileRec?.[key]).length;
    const profileComplete = filledFields === requiredFields.length;

    return [
      {
        label: 'Next Appointment',
        value: next ? `${dayjs(next.date).format('MMM D, YYYY')}` : 'No appointments yet',
        subtext: next ? `with ${next.doctor?.name || 'your doctor'} at ${next.time}` : 'Would you like to book one?',
        action: next ? 'View Details' : 'Book Now',
        icon: <CalendarMonthIcon />,
        path: next ? '/appointments' : '/book',
      },
      {
        label: 'Past Visits',
        value: completedCount.toString(),
        subtext: completedCount === 1 ? 'visit recorded' : 'visits recorded',
        action: 'View Details',
        icon: <HistoryIcon />,
        path: '/appointments',
      },
      {
        label: 'Profile Status',
        value: profileComplete ? 'Ready' : 'Add info',
        subtext: profileComplete
          ? 'All required fields filled'
          : `${filledFields} of ${requiredFields.length} required fields filled`,
        action: 'View Details',
        icon: <PersonIcon />,
        path: '/profile',
      },
    ];
  }, [appointments, profile, isGuest]);

  const handleBookClick = () => {
    if (isGuest) {
      setRestrictionToast('Please create an account to book appointments.');
      return;
    }
    navigate('/book');
  };

  return (
    <Box sx={{ pt: 2, pb: 6, px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title={isGuest ? 'Welcome, Guest!' : `Welcome, ${user?.name || 'Patient'}!`}
        subtitle={isGuest ? 'You are exploring the portal in demo mode.' : 'Book your appointments and view your medical records.'}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={stat.label}>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: stat.label === 'Next Appointment' ? '4px solid #C8862A' : undefined,
              }}>
                <CardActionArea
                  onClick={() => navigate(stat.path)}
                  sx={{
                    height: '100%',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    gap: 2,
                    '&:hover .stat-arrow': { transform: 'translateX(4px)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 1.25,
                        borderRadius: '50%',
                        color: 'primary.main',
                        bgcolor: 'rgba(61, 90, 76, 0.10)',
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25 }} color="text.primary">
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.4 }}>
                      {stat.subtext}
                    </Typography>
                    <Box
                      className="stat-arrow"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: 'primary.main',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      {stat.action}
                      <ArrowForwardIcon sx={{ fontSize: 18, ml: 0.5 }} />
                    </Box>
                  </Box>
                </CardActionArea>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          textAlign: 'left',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 3,
        }}
      >
        <Box sx={{ maxWidth: { sm: '100%', md: '60%' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <EventAvailableIcon sx={{ fontSize: 28, color: '#C8862A' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Ready for your next checkup?
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.95, maxWidth: 520 }}>
            {isGuest
              ? 'This is a demo of the appointment booking feature. Create an account to book real appointments.'
              : 'Quickly book a slot with your doctor without waiting in queues. We\'ll send you a reminder before your visit.'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={handleBookClick}
          sx={{
            bgcolor: '#fff',
            color: '#3D5A4C',
            '&:hover': { bgcolor: '#F7F0E6' },
            px: 4,
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}
        >
          Book Appointment Now
        </Button>
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

export default Dashboard;
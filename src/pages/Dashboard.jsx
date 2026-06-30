import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { appointments, profile } = useSelector((state) => state.patient);

  useEffect(() => {
    dispatch(getPatientProfile());
    dispatch(getAppointments({}));
  }, [dispatch]);

  const stats = useMemo(() => {
    const today = dayjs().startOf('day');

    const upcoming = appointments
      .filter((apt) => !['Cancelled', 'Completed'].includes(apt.status)
        && dayjs(apt.date).startOf('day').isAfter(today.clone().subtract(1, 'day')))
      .sort((a, b) => {
        const dateDiff = dayjs(a.date).diff(dayjs(b.date), 'day');
        if (dateDiff !== 0) return dateDiff;
        return (a.time || '').localeCompare(b.time || '');
      });

    const next = upcoming[0];

    const completedCount = appointments.filter((apt) => apt.status === 'Completed').length;

    const requiredFields = ['name', 'email', 'phone'];
    const filledFields = requiredFields.filter((key) => profile?.[key]).length;
    const profileComplete = filledFields === requiredFields.length;

    return [
      {
        label: 'Next Appointment',
        value: next
          ? `${dayjs(next.date).format('MMM D, YYYY')}`
          : 'No upcoming visit',
        subtext: next
          ? `with ${next.doctor?.name || 'your doctor'} at ${next.time}`
          : 'Tap to book your next appointment',
        icon: <CalendarMonthIcon />,
        path: '/appointments',
      },
      {
        label: 'Past Visits',
        value: completedCount.toString(),
        subtext: completedCount === 1 ? 'visit recorded' : 'visits recorded',
        icon: <HistoryIcon />,
        path: '/appointments',
      },
      {
        label: 'Profile Status',
        value: profileComplete ? 'Complete' : 'Incomplete',
        subtext: profileComplete
          ? 'All required fields filled'
          : `${filledFields} of ${requiredFields.length} required fields filled`,
        icon: <PersonIcon />,
        path: '/profile',
      },
    ];
  }, [appointments, profile]);

  return (
    <Box sx={{ pt: 2, pb: 6, px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title={`Welcome, ${user?.name || 'Patient'}!`}
        subtitle="Manage your health appointments and medical records."
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={stat.label}>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                        bgcolor: 'rgba(21, 101, 192, 0.10)',
                      }}
                    >
                      {React.cloneElement(stat.icon, { sx: { fontSize: 24 } })}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.25 }}>
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
                      View Details
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
          background: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)',
          color: '#fff',
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
            <EventAvailableIcon sx={{ fontSize: 28, color: '#fff' }} />
            <Typography variant="h5" fontWeight={700}>
              Ready for your next checkup?
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.95, maxWidth: 520 }}>
            Quickly book a slot with your doctor without waiting in queues. We'll send you a reminder before your visit.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/book')}
          sx={{
            bgcolor: '#fff',
            color: '#1565C0',
            '&:hover': { bgcolor: '#f0f7ff' },
            px: 4,
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}
        >
          Book Appointment Now
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;

import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
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
      .filter((apt) => !['Cancelled'].includes(apt.status) && dayjs(apt.date).startOf('day').isAfter(today.clone().subtract(1, 'day')))
      .sort((a, b) => {
        const dateDiff = dayjs(a.date).diff(dayjs(b.date), 'day');
        if (dateDiff !== 0) return dateDiff;
        return (a.time || '').localeCompare(b.time || '');
      });

    const next = upcoming[0];
    const nextAppointment = next
      ? `${dayjs(next.date).format('MMM D, YYYY')} · ${next.time}`
      : 'No upcoming appointments';

    const completedCount = appointments.filter((apt) => apt.status === 'Completed').length;

    const profileComplete =
      profile && profile.name && profile.email && profile.phone;
    const profileStatus = profileComplete ? 'Complete' : 'Incomplete';

    return [
      {
        label: 'Next Appointment',
        value: nextAppointment,
        icon: <CalendarMonthIcon />,
        color: '#1565C0',
        path: '/appointments',
      },
      {
        label: 'Past Visits',
        value: completedCount.toString(),
        icon: <HistoryIcon />,
        color: '#00897B',
        path: '/appointments',
      },
      {
        label: 'Profile Status',
        value: profileStatus,
        icon: <PersonIcon />,
        color: '#F57F17',
        path: '/profile',
      },
    ];
  }, [appointments, profile]);

  return (
    <Box sx={{ pt: 2, pb: 6, px: { xs: 1, sm: 2 } }}>
      <PageHeader
        title={`Welcome, ${user?.name || 'Patient'}!`}
        subtitle="Manage your health appointments and medical records."
      />

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={stat.label}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card sx={{ p: 3, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: `${stat.color}20`, color: stat.color }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>{stat.value}</Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => navigate(stat.path)}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 1, color: stat.color }}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 6,
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)',
          color: '#fff',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <LocalHospitalIcon
          sx={{
            position: 'absolute',
            right: -20,
            bottom: -20,
            fontSize: 150,
            opacity: 0.1,
            color: '#fff',
          }}
        />
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Ready for your next checkup?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
          Quickly book a slot with your doctor without waiting in queues.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/book')}
          sx={{
            bgcolor: '#fff',
            color: '#1565C0',
            '&:hover': { bgcolor: '#f0f0f0' },
            px: 4,
            fontWeight: 700,
          }}
        >
          Book Appointment Now
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;

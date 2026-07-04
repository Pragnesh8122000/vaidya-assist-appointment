import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../app/store';
import type { RootState } from '../app/store';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import { getAppointments } from '../features/patientAppointmentSlice';
import { GUEST_APPOINTMENTS } from '../constants/guestData';
import type { GuestAppointment } from '../constants/guestData';

const formatTime12h = (hhmm: string): string => {
  if (!hhmm) return '';
  const d = dayjs(`2000-01-01 ${hhmm}`);
  return d.isValid() ? d.format('h:mm A') : hhmm;
};

const statusColorMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  Waiting: 'warning',
  Confirmed: 'success',
  Cancelled: 'error',
  Completed: 'default',
};

const Appointments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isGuest } = useSelector((state: RootState) => state.auth);
  const { appointments: realAppointments, loading } = useSelector((state: RootState) => state.patient);

  const appointments: GuestAppointment[] = isGuest ? GUEST_APPOINTMENTS : (realAppointments as unknown) as GuestAppointment[];

  useEffect(() => {
    if (!isGuest) {
      dispatch(getAppointments({}));
    }
  }, [dispatch, isGuest]);

  const upcoming = appointments.filter((apt) => !['Cancelled', 'Completed'].includes(apt.status));
  const completed = appointments.filter((apt) => apt.status === 'Completed');

  if (loading && !isGuest) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography color="text.secondary">Loading appointments…</Typography>
      </Box>
    );
  }

  const renderCard = (apt: GuestAppointment, _index: number) => {
    const statusColor = statusColorMap[apt.status] ?? 'default';
    return (
      <Card key={apt._id} sx={{ mb: 2, borderLeft: '4px solid', borderColor: apt.status === 'Waiting' ? '#C8862A' : apt.status === 'Completed' ? 'grey.400' : apt.status === 'Cancelled' ? 'error.main' : 'primary.main' }}>
        <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, py: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <MedicalServicesIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                {apt.doctor?.name || 'Unknown'}
              </Typography>
              <Chip label={apt.status} size="small" color={statusColor} sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 3 }, color: 'text.secondary', fontSize: '0.875rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarMonthIcon sx={{ fontSize: 16 }} />
                {dayjs(apt.date).format('MMM D, YYYY')}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 16 }} />
                {formatTime12h(apt.time)}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon sx={{ fontSize: 16 }} />
                {apt.reason}
              </Box>
            </Box>
          </Box>
          {isGuest ? (
            <Tooltip title="Sign in to use this feature">
              <Chip label="Read-only" size="small" variant="outlined" sx={{ color: 'text.secondary', borderColor: 'divider' }} />
            </Tooltip>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }} />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ pt: 2, pb: 6, px: { xs: 1, sm: 2 } }}>
      <PageHeader title="My Appointments" icon={<CalendarMonthIcon />} />

      {isGuest && (
        <Box sx={{ mb: 2 }}>
          <Chip label="Demo Mode — Read-only" size="small" sx={{ bgcolor: 'rgba(200,134,42,0.12)', color: '#A66B20', fontWeight: 600 }} />
        </Box>
      )}

      {upcoming.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Upcoming</Typography>
          {upcoming.map((apt, i) => renderCard(apt, i))}
        </Box>
      )}

      {completed.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Completed</Typography>
          {completed.map((apt, i) => renderCard(apt, i))}
        </Box>
      )}

      {appointments.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CalendarMonthIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No appointments yet</Typography>
          <Typography variant="body2" color="text.secondary">Book your first appointment to get started.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Appointments;
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
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import RefreshIcon from '@mui/icons-material/Refresh';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import { getAppointments } from '../features/patientAppointmentSlice';
import { GUEST_APPOINTMENTS } from '../constants/guestData';
import type { Appointment, AppointmentStatus } from '../types/store';

const formatTime12h = (hhmm: string): string => {
  if (!hhmm) return '';
  const d = dayjs(`2000-01-01 ${hhmm}`);
  return d.isValid() ? d.format('h:mm A') : hhmm;
};

// FE-4 / §3.2: 'Confirmed' is a real backend status (OQ#3=Option B). The map
// covers every value in the `AppointmentStatus` union plus a fallback.
const statusColorMap: Record<AppointmentStatus, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
  Waiting: 'warning',
  Confirmed: 'info',
  'In Consultation': 'info',
  Completed: 'success',
  Cancelled: 'error',
};

const Appointments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isGuest } = useSelector((state: RootState) => state.auth);
  const { appointments: realAppointments, loading, error } = useSelector((state: RootState) => state.patient);

  // FE-8: cast once to the canonical `Appointment[]` interface instead of
  // double-casting through `GuestAppointment`. The guest list is structurally
  // compatible, so it flows through the same render path.
  const appointments: Appointment[] = isGuest
    ? (GUEST_APPOINTMENTS as Appointment[])
    : realAppointments;

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

  // Error state with retry — surfaced when the appointments fetch fails. Audit FE-2.
  if (!isGuest && error && !loading) {
    return (
      <Box sx={{ pt: 2, pb: 6, px: { xs: 1, sm: 2 } }}>
        <PageHeader title="My Appointments" icon={<CalendarMonthIcon />} />
        <Alert
          severity="error"
          sx={{ mb: 2, maxWidth: 720, mx: 'auto' }}
          action={
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={() => dispatch(getAppointments({}))}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const renderCard = (apt: Appointment, _index: number) => {
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
            {apt.displayId && (
              <Typography
                variant="caption"
                sx={{ display: 'block', mt: 0.75, fontFamily: 'monospace', color: 'text.disabled' }}
              >
                {apt.displayId}
              </Typography>
            )}
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
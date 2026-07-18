import { useEffect, useState } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import RefreshIcon from '@mui/icons-material/Refresh';
import CancelIcon from '@mui/icons-material/Cancel';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import {
  getAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getAvailableSlots,
  clearSlots,
} from '../features/patientAppointmentSlice';
import { GUEST_APPOINTMENTS } from '../constants/guestData';
import { formatTime12h, formatDate } from '../utils/dateFormat';
import type { Appointment, AppointmentStatus } from '../types/store';

// FE-4 / §3.2: 'Confirmed' is a real backend status (OQ#3=Option B). The map
// covers every value in the `AppointmentStatus` union plus a fallback.
const statusColorMap: Record<AppointmentStatus, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
  Waiting: 'warning',
  Confirmed: 'info',
  'In Consultation': 'info',
  Completed: 'success',
  Cancelled: 'error',
};

// UX-1: appointments in these statuses are still active and may be cancelled or
// rescheduled by the patient. `Completed` and `Cancelled` are terminal.
const isActive = (status: AppointmentStatus) => !['Cancelled', 'Completed'].includes(status);

const Appointments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isGuest } = useSelector((state: RootState) => state.auth);
  const {
    appointments: realAppointments,
    loading,
    error,
    actionLoadingId,
    slots,
    slotsLoading,
  } = useSelector((state: RootState) => state.patient);

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

  const upcoming = appointments.filter((apt) => isActive(apt.status));
  const completed = appointments.filter((apt) => apt.status === 'Completed');

  // UX-1: cancel + reschedule dialog state.
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState<{ date: string; time: string }>({
    date: '',
    time: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const appointmentId = (apt: Appointment) => apt.displayId || apt._id;

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    const id = appointmentId(cancelTarget);
    setSubmitting(true);
    try {
      await dispatch(cancelAppointment(id)).unwrap();
      // The slice optimistically replaces the cancelled card, but refetch so the
      // list is authoritative against the backend.
      dispatch(getAppointments({}));
      setCancelTarget(null);
    } catch {
      // slice surfaces the error toast + state.error
    } finally {
      setSubmitting(false);
    }
  };

  const openReschedule = (apt: Appointment) => {
    setRescheduleTarget(apt);
    // Pre-fill with the existing date/time so the patient can tweak one field.
    setRescheduleForm({
      date: dayjs(apt.date).format('YYYY-MM-DD'),
      time: apt.time,
    });
    if (apt.doctor?._id) {
      dispatch(getAvailableSlots({ doctorId: apt.doctor._id, date: dayjs(apt.date).format('YYYY-MM-DD') }));
    }
  };

  const activeSlots = slots &&
    rescheduleTarget?.doctor?._id &&
    slots.doctorId === rescheduleTarget.doctor._id &&
    slots.date === rescheduleForm.date
    ? slots.items.map((slot) => {
      // The patient's current slot is held by their own appointment; allow them
      // to re-select it because the backend excludes this appointment from the
      // conflict check when rescheduling.
      const originalDate = dayjs(rescheduleTarget.date).format('YYYY-MM-DD');
      if (slot.time === rescheduleTarget.time && rescheduleForm.date === originalDate) {
        return { ...slot, available: true };
      }
      return slot;
    })
    : null;

  const handleRescheduleSubmit = async () => {
    if (!rescheduleTarget) return;
    if (!rescheduleForm.date) return;
    if (!rescheduleForm.time) return;
    if (dayjs(rescheduleForm.date).startOf('day').isBefore(dayjs().startOf('day'))) return;
    const id = appointmentId(rescheduleTarget);
    setSubmitting(true);
    try {
      await dispatch(
        rescheduleAppointment({ id, date: rescheduleForm.date, time: rescheduleForm.time }),
      ).unwrap();
      dispatch(getAppointments({}));
      setRescheduleTarget(null);
    } catch {
      // slice surfaces the error toast + state.error
    } finally {
      setSubmitting(false);
    }
  };

  // Only show the full-page loading screen on the initial fetch (no data yet).
  // Once we have appointments, cancel/reschedule's pending state must not hide
  // the list — the per-card `actionLoadingId` handles in-flight button state.
  if (loading && !isGuest && appointments.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography color="text.secondary">Loading appointments…</Typography>
      </Box>
    );
  }

  // Error state with retry — surfaced when the appointments fetch fails. Audit FE-2.
  if (!isGuest && error && !loading && appointments.length === 0) {
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
    const id = appointmentId(apt);
    const busy = !!actionLoadingId && actionLoadingId === id;
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
                {formatDate(apt.date)}
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
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
              {isActive(apt.status) && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    disabled={busy}
                    onClick={() => setCancelTarget(apt)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditCalendarIcon />}
                    disabled={busy}
                    onClick={() => openReschedule(apt)}
                  >
                    Reschedule
                  </Button>
                </>
              )}
            </Box>
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

      {/* UX-1: Cancel confirmation dialog */}
      <Dialog open={!!cancelTarget} onClose={() => (submitting ? undefined : setCancelTarget(null))} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel this appointment?</DialogTitle>
        <DialogContent dividers>
          {cancelTarget && (
            <Typography variant="body2">
              {cancelTarget.doctor?.name || 'This appointment'} on{' '}
              {formatDate(cancelTarget.date)} at {formatTime12h(cancelTarget.time)}.
              This cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCancelTarget(null)} disabled={submitting}>
            Keep it
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelConfirm}
            disabled={submitting}
          >
            {submitting ? 'Cancelling…' : 'Cancel appointment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* UX-1: Reschedule dialog — date + available slot grid so patients can only
          pick times that are actually free (their current slot is shown free). */}
      <Dialog
        open={!!rescheduleTarget}
        onClose={() => {
          if (submitting) return;
          dispatch(clearSlots());
          setRescheduleTarget(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Reschedule appointment</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
            <TextField
              label="New date"
              type="date"
              value={rescheduleForm.date}
              onChange={(e) => {
                const newDate = e.target.value;
                setRescheduleForm((prev) => ({ ...prev, date: newDate, time: '' }));
                if (rescheduleTarget?.doctor?._id && newDate) {
                  dispatch(getAvailableSlots({ doctorId: rescheduleTarget.doctor._id, date: newDate }));
                }
              }}
              required
              slotProps={{ inputLabel: { shrink: true }, input: { inputProps: { min: dayjs().format('YYYY-MM-DD') } } }}
            />

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Available time slots
              </Typography>

              {!rescheduleTarget?.doctor?._id || !rescheduleForm.date ? (
                <Typography variant="body2" color="text.secondary">
                  Select a date to see available times.
                </Typography>
              ) : slotsLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">Loading available times…</Typography>
                </Box>
              ) : activeSlots && activeSlots.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {activeSlots.map((slot: { time: string; available: boolean }) => {
                    const selected = rescheduleForm.time === slot.time;
                    return (
                      <Chip
                        key={slot.time}
                        label={formatTime12h(slot.time)}
                        onClick={() => slot.available && setRescheduleForm((prev) => ({ ...prev, time: slot.time }))}
                        disabled={!slot.available}
                        color={selected ? 'primary' : 'default'}
                        variant={selected ? 'filled' : 'outlined'}
                        clickable={slot.available}
                        sx={{ fontWeight: 600, borderRadius: 2, px: 0.5, minHeight: 36 }}
                      />
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No slots available for this date. Please try another day.
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => {
              dispatch(clearSlots());
              setRescheduleTarget(null);
            }}
            disabled={submitting}
          >
            Go back
          </Button>
          <Button
            variant="contained"
            onClick={handleRescheduleSubmit}
            disabled={submitting || !rescheduleForm.date || !rescheduleForm.time}
          >
            {submitting ? 'Saving…' : 'Confirm reschedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments;
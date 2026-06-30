import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MenuItem from '@mui/material/MenuItem';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import StethoscopeIcon from '@mui/icons-material/MedicalServices';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import {
  getDoctors,
  getAvailableSlots,
  getDependents,
  addDependent,
  bookAppointment,
  clearPatientError,
  clearSlots,
} from '../features/patientAppointmentSlice';

const DOCTOR_SEARCH_DEBOUNCE_MS = 400;

const formatTime12h = (hhmm) => {
  if (!hhmm) return '';
  const d = dayjs(`2000-01-01 ${hhmm}`);
  return d.isValid() ? d.format('h:mm A') : hhmm;
};

const BookAppointment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { doctors, slots, slotsLoading, loading, error, dependents, dependentsLoading } = useSelector((state) => state.patient);
  const [form, setForm] = useState({
    doctorId: '', date: null, time: '', reason: '',
    bookedFor: { type: 'myself', dependentId: null, dependentName: '' },
  });
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [addDepOpen, setAddDepOpen] = useState(false);
  const [newDep, setNewDep] = useState({ name: '', relation: '', age: '', gender: 'Male', bloodGroup: '' });

  // Load doctors (debounced search). Replaces the original mount-time fetch.
  useEffect(() => {
    const t = setTimeout(() => dispatch(getDoctors(search.trim())), DOCTOR_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search, dispatch]);

  // Load saved dependents once, for the "booking for someone else" selector.
  useEffect(() => {
    dispatch(getDependents());
  }, [dispatch]);

  // Load available slots whenever a doctor and date are both selected.
  useEffect(() => {
    if (form.doctorId && form.date) {
      dispatch(getAvailableSlots({ doctorId: form.doctorId, date: form.date.format('YYYY-MM-DD') }));
    } else {
      dispatch(clearSlots());
    }
  }, [form.doctorId, form.date, dispatch]);

  // Preselect a doctor when arriving from a "Book Follow-Up" action (location.state.doctorId).
  useEffect(() => {
    const preDoctorId = location.state?.doctorId;
    if (preDoctorId && !form.doctorId && doctors.some((d) => d._id === preDoctorId)) {
      setForm((prev) => ({ ...prev, doctorId: preDoctorId }));
    }
  }, [doctors, location.state, form.doctorId]);

  const selectedDoctor = doctors.find((d) => d._id === form.doctorId);

  // Only render the slot grid that matches the current selection (guards against races).
  const activeSlots =
    slots && form.date &&
    slots.doctorId === form.doctorId &&
    slots.date === form.date.format('YYYY-MM-DD')
      ? slots.items
      : null;

  const handleDoctorSelect = (doctorId) => {
    setForm((prev) => ({ ...prev, doctorId, time: '' }));
  };

  const handleDateChange = (newValue) => {
    setForm((prev) => ({ ...prev, date: newValue, time: '' }));
  };

  const handleSlotSelect = (slot) => {
    if (!slot.available) return;
    setForm((prev) => ({ ...prev, time: slot.time }));
  };

  const handleBookingForChange = (_, type) => {
    if (type === null) return; // don't allow unselecting
    setForm((prev) => ({
      ...prev,
      bookedFor: type === 'myself'
        ? { type: 'myself', dependentId: null, dependentName: '' }
        : { type: 'dependent', dependentId: null, dependentName: '' },
    }));
  };

  const handleSelectDependent = (dep) => {
    setForm((prev) => ({
      ...prev,
      bookedFor: { type: 'dependent', dependentId: dep._id, dependentName: dep.name },
    }));
  };

  const handleOpenAddDep = () => {
    setNewDep({ name: '', relation: '', age: '', gender: 'Male', bloodGroup: '' });
    setAddDepOpen(true);
  };

  const handleAddDependent = async () => {
    if (!newDep.name.trim() || !newDep.relation.trim()) {
      toast.error('Please enter at least a name and relation');
      return;
    }
    try {
      const list = await dispatch(addDependent({
        name: newDep.name.trim(),
        relation: newDep.relation.trim(),
        age: newDep.age ? Number(newDep.age) : undefined,
        gender: newDep.gender,
        bloodGroup: newDep.bloodGroup || undefined,
      })).unwrap();
      const created = list?.[list.length - 1];
      setAddDepOpen(false);
      if (created) handleSelectDependent(created);
    } catch {
      // slice shows the error toast
    }
  };

  const validate = () => {
    if (form.bookedFor.type === 'dependent' && !form.bookedFor.dependentId) {
      toast.error('Please choose who the appointment is for, or add a new person');
      return false;
    }
    if (!form.doctorId) { toast.error('Please select a doctor'); return false; }
    if (!form.date) { toast.error('Please select a date'); return false; }
    if (!form.time) { toast.error('Please choose an available time slot'); return false; }
    if (!form.reason?.trim()) { toast.error('Please describe what you need help with'); return false; }
    if (form.date.startOf('day').isBefore(dayjs().startOf('day'))) {
      toast.error('Cannot book an appointment in the past');
      return false;
    }
    return true;
  };

  const handleReviewClick = (e) => {
    e.preventDefault();
    dispatch(clearPatientError());
    if (validate()) setReviewOpen(true);
  };

  const handleConfirmBooking = async () => {
    const payload = {
      doctorId: form.doctorId,
      date: form.date.startOf('day').format('YYYY-MM-DD'),
      time: form.time,
      reason: form.reason.trim(),
      bookedFor: form.bookedFor.type === 'dependent'
        ? { type: 'dependent', dependentId: form.bookedFor.dependentId }
        : { type: 'myself' },
    };
    setSubmitting(true);
    try {
      await dispatch(bookAppointment(payload)).unwrap();
      setReviewOpen(false);
      navigate('/appointments');
    } catch {
      // Error toast + state.error are set by the slice; keep modal open so the user can retry.
    } finally {
      setSubmitting(false);
    }
  };

  const bookingForName = form.bookedFor.type === 'dependent' ? form.bookedFor.dependentName : 'Myself';

  const doctorReady = form.doctorId && form.date;
  const formattedDate = form.date ? form.date.format('dddd, MMMM D, YYYY') : '';

  return (
    <Box sx={{ pt: 2, pb: 6, px: { xs: 1, sm: 2 } }}>
      <PageHeader title="Book an Appointment" icon={<CalendarMonthIcon />} />

      {error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: 720, mx: 'auto' }} onClose={() => dispatch(clearPatientError())}>
          {error}
        </Alert>
      )}

      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        {/* Step 0 — Who is this appointment for? (book-for-someone-else, audit #22) */}
        <Card sx={{ mb: 3, boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(33,28,22,0.08)') }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ display: 'inline-flex', p: 0.75, borderRadius: '50%', bgcolor: 'rgba(61,90,76,0.10)', color: 'primary.main' }}>
                <GroupIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" component="h2" fontWeight={700}>Who is this appointment for?</Typography>
            </Box>

            <ToggleButtonGroup
              exclusive
              value={form.bookedFor.type}
              onChange={handleBookingForChange}
              sx={{ mb: form.bookedFor.type === 'dependent' ? 2 : 0, flexWrap: 'wrap', gap: 1 }}
            >
              <ToggleButton value="myself" sx={{ px: 3, py: 1, borderRadius: 2, borderColor: 'divider' }}>
                <PersonIcon sx={{ mr: 1, fontSize: 20 }} /> Myself
              </ToggleButton>
              <ToggleButton value="dependent" sx={{ px: 3, py: 1, borderRadius: 2, borderColor: 'divider' }}>
                <GroupIcon sx={{ mr: 1, fontSize: 20 }} /> Someone else
              </ToggleButton>
            </ToggleButtonGroup>

            {form.bookedFor.type === 'dependent' && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Choose a family member, or add a new person. Their name will appear on the appointment.
                </Typography>
                {dependentsLoading ? (
                  <Typography variant="body2" color="text.secondary">Loading…</Typography>
                ) : dependents.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      You haven&apos;t added anyone yet.
                    </Typography>
                    <Button size="small" startIcon={<PersonAddIcon />} onClick={handleOpenAddDep} variant="outlined">
                      Add a new person
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                    {dependents.map((dep) => {
                      const selected = form.bookedFor.dependentId === dep._id;
                      return (
                        <Chip
                          key={dep._id}
                          label={`${dep.name} (${dep.relation})`}
                          onClick={() => handleSelectDependent(dep)}
                          color={selected ? 'primary' : 'default'}
                          variant={selected ? 'filled' : 'outlined'}
                          clickable
                          sx={{ fontWeight: 600, borderRadius: 2, px: 0.5, minHeight: 36 }}
                        />
                      );
                    })}
                    <Chip
                      label="Add new"
                      onClick={handleOpenAddDep}
                      variant="outlined"
                      clickable
                      icon={<PersonAddIcon />}
                      sx={{ fontWeight: 600, borderRadius: 2, px: 0.5, minHeight: 36, borderStyle: 'dashed' }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Step 1 — Choose a doctor */}
        <Card sx={{ mb: 3, boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(33,28,22,0.08)') }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ display: 'inline-flex', p: 0.75, borderRadius: '50%', bgcolor: 'rgba(61,90,76,0.10)', color: 'primary.main' }}>
                <PersonIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" component="h2" fontWeight={700}>1. Choose your doctor</Typography>
            </Box>

            <TextField
              fullWidth
              size="small"
              placeholder="Search by doctor name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
              slotProps={{ input: { startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> } }}
            />

            {loading && doctors.length === 0 ? (
              <Grid container spacing={2}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={i}>
                    <Skeleton variant="rounded" height={92} />
                  </Grid>
                ))}
              </Grid>
            ) : doctors.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No doctors found. Try a different search.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {doctors.map((doc) => {
                  const selected = form.doctorId === doc._id;
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={doc._id}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderColor: selected ? 'primary.main' : 'divider',
                          borderWidth: selected ? 2 : 1,
                          bgcolor: selected ? 'rgba(61,90,76,0.06)' : 'background.paper',
                          transition: 'border-color 0.2s ease, background 0.2s ease',
                        }}
                      >
                        <CardActionArea onClick={() => handleDoctorSelect(doc._id)} sx={{ p: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
                              {doc.name?.charAt(0)?.toUpperCase() || 'D'}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="body2" fontWeight={700} noWrap>Dr. {doc.name}</Typography>
                                {selected && <CheckCircleIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
                              </Box>
                              <Typography variant="caption" color="text.secondary" noWrap component="div">
                                {doc.email}
                                {doc.email && doc.phone ? ' · ' : ''}
                                {doc.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Step 2 — Pick a date and time */}
        <Card sx={{ mb: 3, boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(33,28,22,0.08)') }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ display: 'inline-flex', p: 0.75, borderRadius: '50%', bgcolor: 'rgba(61,90,76,0.10)', color: 'primary.main' }}>
                <CalendarMonthIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" component="h2" fontWeight={700}>2. Pick a date and time</Typography>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, textAlign: 'right' }}>
              * Required fields
            </Typography>

            <DatePicker
              label="Appointment Date"
              value={form.date}
              onChange={handleDateChange}
              minDate={dayjs().startOf('day')}
              slots={{ openPickerIcon: EventIcon }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  helperText: formattedDate ? `Selected: ${formattedDate}` : 'Pick a future date',
                  slotProps: { input: { startAdornment: <CalendarMonthIcon sx={{ mr: 1, color: 'text.secondary' }} /> } },
                },
              }}
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
                Available time slots
              </Typography>

              {!doctorReady ? (
                <Typography variant="body2" color="text.secondary">
                  Select a doctor and a date to see available times.
                </Typography>
              ) : slotsLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">Loading available times…</Typography>
                </Box>
              ) : activeSlots && activeSlots.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {activeSlots.map((slot) => {
                    const selected = form.time === slot.time;
                    return (
                      <Chip
                        key={slot.time}
                        label={formatTime12h(slot.time)}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.available}
                        color={selected ? 'primary' : 'default'}
                        variant={selected ? 'filled' : 'outlined'}
                        clickable={slot.available}
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 0.5,
                          minHeight: 36,
                          ...(selected ? {} : { borderColor: 'rgba(0,0,0,0.18)' }),
                        }}
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
          </CardContent>
        </Card>

        {/* Step 3 — Reason */}
        <Card sx={{ mb: 3, boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(33,28,22,0.08)') }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ display: 'inline-flex', p: 0.75, borderRadius: '50%', bgcolor: 'rgba(61,90,76,0.10)', color: 'primary.main' }}>
                <StethoscopeIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" component="h2" fontWeight={700}>3. What do you need help with?</Typography>
            </Box>
            <Box component="form" onSubmit={handleReviewClick}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                required
                placeholder="Briefly describe why you're visiting..."
              />
              <Button
                variant="contained"
                fullWidth
                size="large"
                type="submit"
                disabled={loading || submitting}
                sx={{ mt: 3, py: 1.5, fontWeight: 700, borderRadius: 2 }}
              >
                {loading || submitting ? <CircularProgress size={24} color="inherit" /> : 'Review Booking'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Review / confirm step */}
      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Please review your appointment</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ReviewRow icon={<GroupIcon color="action" />} label="Booking for" value={bookingForName} />
            <ReviewRow icon={<PersonIcon color="action" />} label="Doctor" value={selectedDoctor ? `Dr. ${selectedDoctor.name}` : '—'} />
            <ReviewRow icon={<CalendarMonthIcon color="action" />} label="Date" value={formattedDate || '—'} />
            <ReviewRow icon={<AccessTimeIcon color="action" />} label="Time" value={formatTime12h(form.time) || '—'} />
            <ReviewRow icon={<StethoscopeIcon color="action" />} label="Reason" value={form.reason?.trim() || '—'} />
          </Box>
          <Alert severity="info" sx={{ mt: 2 }} icon={false}>
            Please confirm these details. You can go back to change anything before booking.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setReviewOpen(false)} disabled={submitting}>
            Go Back
          </Button>
          <Button variant="contained" onClick={handleConfirmBooking} disabled={submitting} startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}>
            {submitting ? 'Booking…' : 'Book My Appointment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add a new dependent (#22) */}
      <Dialog open={addDepOpen} onClose={() => setAddDepOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Add a new person</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
            <TextField
              label="Full name"
              value={newDep.name}
              onChange={(e) => setNewDep({ ...newDep, name: e.target.value })}
              required
              autoFocus
            />
            <TextField
              label="Relation (e.g. Spouse, Parent, Child)"
              value={newDep.relation}
              onChange={(e) => setNewDep({ ...newDep, relation: e.target.value })}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Age"
                type="number"
                value={newDep.age}
                onChange={(e) => setNewDep({ ...newDep, age: e.target.value })}
                sx={{ flex: 1 }}
              />
              <TextField
                select
                label="Gender"
                value={newDep.gender}
                onChange={(e) => setNewDep({ ...newDep, gender: e.target.value })}
                sx={{ flex: 1 }}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Box>
            <TextField
              label="Blood group (optional)"
              value={newDep.bloodGroup}
              onChange={(e) => setNewDep({ ...newDep, bloodGroup: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAddDepOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddDependent}>Add person</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const ReviewRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
    <Box sx={{ display: 'inline-flex', mt: 0.25 }}>{icon}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={600} sx={{ wordBreak: 'break-word' }}>{value}</Typography>
    </Box>
  </Box>
);

export default BookAppointment;
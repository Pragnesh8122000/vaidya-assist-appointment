import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import StethoscopeIcon from '@mui/icons-material/MedicalServices';
import EventIcon from '@mui/icons-material/Event';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import { getDoctors, bookAppointment, clearPatientError } from '../features/patientAppointmentSlice';

const BookAppointment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { doctors, loading, error } = useSelector((state) => state.patient);
  const [form, setForm] = useState({
    doctorId: '', date: null, time: null, reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getDoctors());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearPatientError());

    if (!form.doctorId) {
      toast.error('Please select a doctor');
      return;
    }
    if (!form.date) {
      toast.error('Please select a date');
      return;
    }
    if (!form.time) {
      toast.error('Please select a time');
      return;
    }
    if (!form.reason?.trim()) {
      toast.error('Please enter a reason for the visit');
      return;
    }

    const selectedDate = form.date.startOf('day');
    if (selectedDate.isBefore(dayjs().startOf('day'))) {
      toast.error('Cannot book an appointment in the past');
      return;
    }

    const payload = {
      doctorId: form.doctorId,
      date: selectedDate.format('YYYY-MM-DD'),
      time: form.time.format('HH:mm'),
      reason: form.reason.trim(),
    };

    setSubmitting(true);
    try {
      await dispatch(bookAppointment(payload)).unwrap();
      navigate('/appointments');
    } catch {
      // Error is already shown by the slice; keep submit button enabled for retry.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ pt: 2, pb: 6, px: { xs: 1, sm: 2 } }}>
      <PageHeader title="Book an Appointment" icon={<CalendarMonthIcon />} />

      {error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }} onClose={() => dispatch(clearPatientError())}>
          {error}
        </Alert>
      )}

      <Card sx={{ maxWidth: 600, mx: 'auto', boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(21,101,192,0.12)') }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Select Doctor"
              select
              value={form.doctorId}
              onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
              required
              slotProps={{
                input: { startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} /> },
              }}
            >
              <MenuItem value=""><em>Choose a doctor</em></MenuItem>
              {doctors.length === 0 && (
                <MenuItem disabled>
                  <Typography variant="caption" color="text.secondary">No doctors available</Typography>
                </MenuItem>
              )}
              {doctors.map((doc) => (
                <MenuItem key={doc._id} value={doc._id}>
                  <StethoscopeIcon sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="body2" fontWeight={600}>Dr. {doc.name}</Typography>
                    {(doc.email || doc.phone) && (
                      <Typography variant="caption" color="text.secondary">
                        {doc.email}
                        {doc.email && doc.phone ? ' · ' : ''}
                        {doc.phone}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <DatePicker
              label="Appointment Date"
              value={form.date}
              onChange={(newValue) => setForm({ ...form, date: newValue })}
              minDate={dayjs().startOf('day')}
              slots={{ openPickerIcon: EventIcon }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  helperText: 'Pick a future date',
                  slotProps: { input: { startAdornment: <CalendarMonthIcon sx={{ mr: 1, color: 'text.secondary' }} /> } },
                },
              }}
            />

            <TimePicker
              label="Appointment Time"
              value={form.time}
              onChange={(newValue) => setForm({ ...form, time: newValue })}
              ampm={false}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  slotProps: { input: { startAdornment: <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} /> } },
                },
              }}
            />

            <TextField
              fullWidth
              label="Reason for Visit"
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
              sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
            >
              {loading || submitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm Booking'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookAppointment;

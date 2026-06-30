import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Avatar from '@mui/material/Avatar';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CancelIcon from '@mui/icons-material/Cancel';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import ReplayIcon from '@mui/icons-material/Replay';
import MedicationIcon from '@mui/icons-material/Medication';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import api from '../api/axios';
import {
  getAppointments,
  getAvailableSlots,
  cancelAppointment,
  rescheduleAppointment,
  getPrescription,
  clearPatientError,
  clearSlots,
  clearPrescription,
} from '../features/patientAppointmentSlice';
import { STATUS_META, STATUS_ORDER, isUpcomingStatus, isPastStatus, formatReason } from '../theme/statusTokens';

const REASON_MAX_LENGTH = 80;

const formatTime12h = (hhmm) => {
  if (!hhmm) return '';
  const d = dayjs(`2000-01-01 ${hhmm}`);
  return d.isValid() ? d.format('h:mm A') : hhmm;
};

const Appointments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointments, slots, slotsLoading, actionLoadingId, loading, error, prescription, prescriptionLoading } = useSelector((state) => state.patient);
  const [statusFilter, setStatusFilter] = useState('');

  // Dialog + menu state
  const [viewApt, setViewApt] = useState(null);
  const [cancelApt, setCancelApt] = useState(null);
  const [rescheduleApt, setRescheduleApt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuApt, setMenuApt] = useState(null);
  const [rxApt, setRxApt] = useState(null);

  useEffect(() => {
    dispatch(getAppointments({ status: statusFilter || undefined }))
      .unwrap()
      .catch((err) => toast.error(err || 'Failed to load appointments'));
  }, [dispatch, statusFilter]);

  // Load slots for the reschedule dialog when a date is chosen.
  useEffect(() => {
    if (rescheduleApt && rescheduleDate) {
      dispatch(getAvailableSlots({ doctorId: rescheduleApt.doctor?._id || rescheduleApt.doctor, date: rescheduleDate.format('YYYY-MM-DD') }));
    } else {
      dispatch(clearSlots());
    }
  }, [rescheduleApt, rescheduleDate, dispatch]);

  const activeRescheduleSlots =
    slots && rescheduleDate &&
    slots.doctorId === (rescheduleApt?.doctor?._id || rescheduleApt?.doctor) &&
    slots.date === rescheduleDate.format('YYYY-MM-DD')
      ? slots.items
      : null;

  const openReschedule = (apt) => {
    setMenuAnchor(null);
    setRescheduleApt(apt);
    setRescheduleDate(dayjs(apt.date));
    setRescheduleTime('');
  };

  const closeReschedule = () => {
    setRescheduleApt(null);
    setRescheduleDate(null);
    setRescheduleTime('');
    dispatch(clearSlots());
  };

  const openMenu = (e, apt) => {
    setMenuAnchor(e.currentTarget);
    setMenuApt(apt);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuApt(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancelApt) return;
    try {
      await dispatch(cancelAppointment(cancelApt._id)).unwrap();
      setCancelApt(null);
    } catch {
      // slice shows the error toast; keep dialog open so the user can retry or dismiss
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleApt || !rescheduleDate || !rescheduleTime) {
      toast.error('Please pick a new date and time slot');
      return;
    }
    const payload = {
      id: rescheduleApt._id,
      date: rescheduleDate.startOf('day').format('YYYY-MM-DD'),
      time: rescheduleTime,
    };
    try {
      await dispatch(rescheduleAppointment(payload)).unwrap();
      closeReschedule();
    } catch {
      // slice shows the error toast
    }
  };

  const handleFollowUp = (apt) => {
    setMenuAnchor(null);
    const doctorId = apt.doctor?._id || apt.doctor;
    navigate('/book', { state: { doctorId } });
  };

  const openPrescription = (apt) => {
    setMenuAnchor(null);
    setRxApt(apt);
    dispatch(getPrescription(apt._id));
  };

  const closePrescription = () => {
    setRxApt(null);
    dispatch(clearPrescription());
  };

  // Download a scanned prescription file via the patient-owned endpoint
  // (the staff /files/:id/download route is gated behind view_files).
  const handleDownloadFile = async (fileId) => {
    try {
      const res = await api.get(
        `/patient-portal/appointments/${rxApt._id}/prescription/files/${fileId}/download`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      // Best-effort filename from the blob's content disposition, else a default.
      a.download = `prescription-${rxApt._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download the file');
    }
  };

  // Print just the prescription by opening a clean window with the slip HTML.
  const handlePrintPrescription = () => {
    const meds = prescription?.prescription?.medications || [];
    const notes = prescription?.prescription?.notes || '';
    const doctor = rxApt?.doctor?.name || 'your doctor';
    const date = dayjs(rxApt?.date).format('MMMM D, YYYY');
    const time = formatTime12h(rxApt?.time);
    const slip = `
      <div style="max-width:680px;margin:0 auto;font-family:Georgia,serif;color:#211C16;">
        <div style="border-left:4px solid #C8862A;padding:8px 0 8px 20px;margin-bottom:24px;">
          <div style="font-size:22px;font-weight:700;">Vaidya — Prescription</div>
          <div style="color:#5C5448;font-family:'Atkinson Hyperlegible',Arial,sans-serif;font-size:14px;">
            ${doctor} · ${date} at ${time}
          </div>
        </div>
        <div style="font-family:'Atkinson Hyperlegible',Arial,sans-serif;font-size:15px;">
          ${meds.map((m, i) => `
            <div style="margin-bottom:14px;border-bottom:1px dashed #E5DFD3;padding-bottom:8px;">
              <div style="font-weight:700;font-size:16px;">${i + 1}. ${m.name}</div>
              <div style="color:#5C5448;margin-top:2px;">
                ${[m.dosage, m.frequency, m.duration].filter(Boolean).join(' · ')}
              </div>
              ${m.instructions ? `<div style="color:#5C5448;margin-top:2px;font-style:italic;">${m.instructions}</div>` : ''}
            </div>
          `).join('')}
          ${notes ? `<div style="margin-top:16px;"><strong>Notes:</strong> ${notes}</div>` : ''}
          <div style="margin-top:32px;color:#8a8073;font-size:12px;">
            This prescription was generated by the Vaidya Patient Portal. Verify with your doctor before use.
          </div>
        </div>
      </div>`;
    const win = window.open('', '_blank', 'width=720,height=900');
    if (!win) {
      toast.error('Please allow pop-ups to print the prescription');
      return;
    }
    win.document.write(`<!doctype html><html><head><title>Prescription — ${doctor} — ${date}</title>
      <style>body{font-family:'Atkinson Hyperlegible',Arial,sans-serif;background:#fff;padding:32px;margin:0;}</style>
      </head><body>${slip}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const statusFilterControl = (
    <TextField
      select
      size="small"
      label="Filter by status"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      sx={{ minWidth: 175 }}
    >
      <MenuItem value="">All appointments</MenuItem>
      {STATUS_ORDER.map((status) => (
        <MenuItem key={status} value={status}>{STATUS_META[status].label}</MenuItem>
      ))}
    </TextField>
  );

  const renderSkeletonRows = () => (
    <TableBody>
      {Array.from({ length: 5 }).map((_, idx) => (
        <TableRow key={idx}>
          <TableCell><Skeleton variant="text" width={120} /></TableCell>
          <TableCell><Skeleton variant="text" width={110} /></TableCell>
          <TableCell><Skeleton variant="text" width={80} /></TableCell>
          <TableCell><Skeleton variant="text" width={160} /></TableCell>
          <TableCell><Skeleton variant="rounded" width={84} height={22} sx={{ borderRadius: 999 }} /></TableCell>
          <TableCell align="right"><Skeleton variant="rounded" width={96} height={32} /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  const renderEmptyState = () => (
    <Paper
      sx={{
        p: { xs: 4, sm: 6 },
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          p: 2,
          borderRadius: '50%',
          bgcolor: 'rgba(61, 90, 76, 0.10)',
          color: 'primary.main',
          mb: 1,
        }}
      >
        <EventBusyIcon sx={{ fontSize: 32 }} />
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          No appointments yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 360, mx: 'auto' }}>
          Book your first visit and keep track of your health in one place.
        </Typography>
      </Box>
      <Button
        variant="contained"
        size="large"
        startIcon={<AddIcon />}
        onClick={() => navigate('/book')}
      >
        Book your first appointment
      </Button>
    </Paper>
  );

  return (
    <Box sx={{ pt: 2, pb: 6, px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="My Appointments"
        icon={<CalendarMonthIcon />}
        subtitle="View and manage your upcoming and past visits."
        actions={statusFilterControl}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearPatientError())}>
          {error}
        </Alert>
      )}

      {loading ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            {renderSkeletonRows()}
          </Table>
        </TableContainer>
      ) : appointments.length === 0 ? (
        renderEmptyState()
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" sx={{ width: '100%', tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Doctor</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '15%' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '11%', display: { xs: 'none', sm: 'table-cell' } }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '12%' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, width: { xs: 56, sm: 300 } }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((apt) => {
                const meta = STATUS_META[apt.status] || STATUS_META.Waiting;
                const upcoming = isUpcomingStatus(apt.status);
                const past = isPastStatus(apt.status);
                const canEdit = apt.status === 'Waiting';
                const acting = actionLoadingId === apt._id;
                const doctorName = apt.doctor?.name || 'Unknown doctor';
                const formattedReason = formatReason(apt.reason, REASON_MAX_LENGTH);
                const isCompleted = apt.status === 'Completed';
                const forDependent = apt.bookedFor?.type === 'dependent' && apt.bookedFor?.dependentName;

                return (
                  <TableRow
                    key={apt._id}
                    hover
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      opacity: upcoming ? 1 : 0.82,
                    }}
                  >
                    <TableCell sx={{ pr: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main', flexShrink: 0 }}>
                          {doctorName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{doctorName}</Typography>
                          {forDependent && (
                            <Typography variant="caption" noWrap sx={{ display: 'block', color: '#A66B20', fontWeight: 600 }}>
                              for {apt.bookedFor.dependentName}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>{dayjs(apt.date).format('MMM D, YYYY')}</Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, whiteSpace: 'nowrap' }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{formatTime12h(apt.time)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2" color="text.secondary" title={apt.reason || ''} noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {formattedReason || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={meta.label}
                        sx={{ fontWeight: 600, borderRadius: '999px', color: meta.fg, bgcolor: meta.bg, border: 'none' }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ width: { xs: 56, sm: 300 } }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap', justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon fontSize="small" />}
                          onClick={() => setViewApt(apt)}
                          sx={{ minWidth: 'auto', display: { xs: 'none', sm: 'inline-flex' } }}
                        >
                          View
                        </Button>
                        {isCompleted && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<MedicationIcon fontSize="small" />}
                            onClick={() => openPrescription(apt)}
                            sx={{ minWidth: 'auto', display: { xs: 'none', sm: 'inline-flex' }, borderColor: '#C8862A', color: '#A66B20' }}
                          >
                            Rx
                          </Button>
                        )}
                        {canEdit ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={acting ? <CircularProgress size={14} /> : <EditIcon fontSize="small" />}
                            onClick={() => openReschedule(apt)}
                            disabled={acting}
                            sx={{ minWidth: 'auto', display: { xs: 'none', sm: 'inline-flex' } }}
                          >
                            Edit
                          </Button>
                        ) : null}
                        <IconButton
                          aria-label={`More actions for ${doctorName}`}
                          aria-controls={menuApt?._id === apt._id ? 'apt-actions-menu' : undefined}
                          aria-haspopup="true"
                          onClick={(e) => openMenu(e, apt)}
                          disabled={acting}
                          sx={{ padding: '9px' }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Row actions menu */}
      <Menu
        id="apt-actions-menu"
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        slotProps={{ paper: { sx: { minWidth: 220 } } }}
      >
        {menuApt && menuApt.status === 'Waiting' && (
          <MenuItem onClick={() => openReschedule(menuApt)}>
            <ListItemIcon><EditCalendarIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Edit time</ListItemText>
          </MenuItem>
        )}
        {menuApt && menuApt.status === 'Waiting' && (
          <MenuItem onClick={() => { setMenuAnchor(null); setCancelApt(menuApt); }}>
            <ListItemIcon><CancelIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Cancel appointment</ListItemText>
          </MenuItem>
        )}
        {menuApt && isPastStatus(menuApt.status) && (
          <MenuItem onClick={() => handleFollowUp(menuApt)}>
            <ListItemIcon><ReplayIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText>Book follow-up</ListItemText>
          </MenuItem>
        )}
        {menuApt && menuApt.status === 'Completed' && (
          <MenuItem onClick={() => openPrescription(menuApt)}>
            <ListItemIcon><MedicationIcon fontSize="small" sx={{ color: '#A66B20' }} /></ListItemIcon>
            <ListItemText>View prescription</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { setMenuAnchor(null); setViewApt(menuApt); }}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View details</ListItemText>
        </MenuItem>
      </Menu>

      {/* View details dialog */}
      <Dialog open={Boolean(viewApt)} onClose={() => setViewApt(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Appointment details</DialogTitle>
        <DialogContent dividers>
          {viewApt && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <DetailRow label="Doctor" value={viewApt.doctor?.name || 'Unknown doctor'} />
              <DetailRow label="Date" value={dayjs(viewApt.date).format('dddd, MMM D, YYYY')} />
              <DetailRow label="Time" value={formatTime12h(viewApt.time)} />
              <DetailRow label="Status" value={STATUS_META[viewApt.status]?.label || viewApt.status} />
              <DetailRow label="Booking for" value={viewApt.bookedFor?.type === 'dependent' && viewApt.bookedFor?.dependentName ? viewApt.bookedFor.dependentName : 'Myself'} />
              <DetailRow label="Reason" value={viewApt.reason ? formatReason(viewApt.reason, 500) : '—'} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="contained" onClick={() => setViewApt(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel confirmation dialog */}
      <Dialog open={Boolean(cancelApt)} onClose={() => setCancelApt(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel this appointment?</DialogTitle>
        <DialogContent dividers>
          {cancelApt && (
            <Typography variant="body1">
              {cancelApt.doctor?.name || 'Your appointment'} on{' '}
              {dayjs(cancelApt.date).format('MMM D, YYYY')} at {formatTime12h(cancelApt.time)}.
            </Typography>
          )}
          <Alert severity="warning" sx={{ mt: 2 }} icon={false}>
            This can&apos;t be undone. You can book a new appointment anytime.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCancelApt(null)} disabled={actionLoadingId === cancelApt?._id}>Keep it</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmCancel}
            disabled={actionLoadingId === cancelApt?._id}
            startIcon={actionLoadingId === cancelApt?._id ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {actionLoadingId === cancelApt?._id ? 'Cancelling…' : 'Yes, cancel it'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reschedule (edit) dialog */}
      <Dialog open={Boolean(rescheduleApt)} onClose={closeReschedule} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Edit appointment time</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pick a new date and an available time slot for {rescheduleApt?.doctor?.name || 'your doctor'}.
          </Typography>
          <DatePicker
            label="New date"
            value={rescheduleDate}
            onChange={(v) => { setRescheduleDate(v); setRescheduleTime(''); }}
            minDate={dayjs().startOf('day')}
            slotProps={{
              textField: {
                fullWidth: true,
                helperText: rescheduleDate ? `Selected: ${rescheduleDate.format('dddd, MMM D, YYYY')}` : 'Pick a future date',
                slotProps: { input: { startAdornment: <CalendarMonthIcon sx={{ mr: 1, color: 'text.secondary' }} /> } },
              },
            }}
          />
          <Box sx={{ mt: 2.5 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>Available time slots</Typography>
            {slotsLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">Loading available times…</Typography>
              </Box>
            ) : activeRescheduleSlots && activeRescheduleSlots.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {activeRescheduleSlots.map((slot) => {
                  const selected = rescheduleTime === slot.time;
                  return (
                    <Chip
                      key={slot.time}
                      label={formatTime12h(slot.time)}
                      onClick={() => slot.available && setRescheduleTime(slot.time)}
                      disabled={!slot.available}
                      color={selected ? 'primary' : 'default'}
                      variant={selected ? 'filled' : 'outlined'}
                      clickable={slot.available}
                      sx={{ fontWeight: 600, borderRadius: 2, px: 0.5, minHeight: 36, ...(selected ? {} : { borderColor: 'rgba(0,0,0,0.18)' }) }}
                    />
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No slots available for this date. Try another day.</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeReschedule} disabled={actionLoadingId === rescheduleApt?._id}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmReschedule}
            disabled={actionLoadingId === rescheduleApt?._id || !rescheduleTime}
            startIcon={actionLoadingId === rescheduleApt?._id ? <CircularProgress size={18} color="inherit" /> : <EditCalendarIcon />}
          >
            {actionLoadingId === rescheduleApt?._id ? 'Saving…' : 'Save New Time'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Prescription dialog (#23) */}
      <Dialog open={Boolean(rxApt)} onClose={closePrescription} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MedicationIcon sx={{ color: '#C8862A' }} />
          Prescription
        </DialogTitle>
        <DialogContent dividers>
          {rxApt && (
            <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {rxApt.doctor?.name || 'Your doctor'} · {dayjs(rxApt.date).format('MMM D, YYYY')} at {formatTime12h(rxApt.time)}
              </Typography>
              {rxApt.bookedFor?.type === 'dependent' && rxApt.bookedFor?.dependentName && (
                <Typography variant="caption" sx={{ color: '#A66B20', fontWeight: 600 }}>
                  For: {rxApt.bookedFor.dependentName}
                </Typography>
              )}
            </Box>
          )}

          {prescriptionLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 3 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">Loading prescription…</Typography>
            </Box>
          ) : prescription?.prescription?.medications?.length ? (
            // Prescription-slip signature: warm paper with a turmeric left stripe.
            <Box sx={{
              bgcolor: '#FCFAF6',
              border: '1px solid #E5DFD3',
              borderLeft: '4px solid #C8862A',
              borderRadius: 2,
              p: 2.5,
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {prescription.prescription.medications.map((m, i) => (
                  <Box key={i} sx={{ pb: 1.5, borderBottom: i < prescription.prescription.medications.length - 1 ? '1px dashed #E5DFD3' : 'none' }}>
                    <Typography variant="body1" fontWeight={700}>{i + 1}. {m.name}</Typography>
                    {(m.dosage || m.frequency || m.duration) && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {[m.dosage, m.frequency, m.duration].filter(Boolean).join(' · ')}
                      </Typography>
                    )}
                    {m.instructions && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontStyle: 'italic' }}>
                        {m.instructions}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
              {prescription.prescription.notes && (
                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #E5DFD3' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Notes</Typography>
                  <Typography variant="body2" sx={{ mt: 0.25 }}>{prescription.prescription.notes}</Typography>
                </Box>
              )}
              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#8a8073' }}>
                Verify with your doctor before starting or changing medication.
              </Typography>
            </Box>
          ) : prescription?.files?.length ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                No structured prescription was written for this visit, but your doctor uploaded a scanned copy:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {prescription.files.map((file) => (
                  <Box
                    key={file._id}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25,
                      border: '1px solid', borderColor: 'divider', borderRadius: 2,
                    }}
                  >
                    <DescriptionIcon color="action" />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{file.originalName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(file.createdAt).format('MMM D, YYYY')}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon fontSize="small" />}
                      onClick={() => handleDownloadFile(file._id)}
                    >
                      Download
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No prescription on file yet for this visit.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Your doctor will add one after your consultation.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closePrescription}>Close</Button>
          {prescription?.prescription?.medications?.length > 0 && (
            <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrintPrescription}>
              Print
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const DetailRow = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body1" fontWeight={600} sx={{ wordBreak: 'break-word' }}>{value}</Typography>
  </Box>
);

export default Appointments;
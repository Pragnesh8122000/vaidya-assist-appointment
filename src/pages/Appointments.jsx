import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import { getAppointments, clearPatientError } from '../features/patientAppointmentSlice';

const statusColors = {
  Waiting: { color: 'warning', label: 'Waiting' },
  'In Consultation': { color: 'info', label: 'In Consultation' },
  Completed: { color: 'success', label: 'Completed' },
  Cancelled: { color: 'error', label: 'Cancelled' },
};

const Appointments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointments, loading, error } = useSelector((state) => state.patient);
  const [statusFilter, setStatusFilter] = React.useState('');

  useEffect(() => {
    dispatch(getAppointments({ status: statusFilter || undefined }))
      .unwrap()
      .catch((err) => toast.error(err || 'Failed to load appointments'));
  }, [dispatch, statusFilter]);

  const statusFilters = (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {Object.keys(statusColors).map((status) => (
        <Chip
          key={status}
          label={status}
          onClick={() => setStatusFilter(status === statusFilter ? '' : status)}
          color={statusFilter === status ? statusColors[status].color : 'default'}
          variant={statusFilter === status ? 'filled' : 'outlined'}
          size="small"
          sx={{ cursor: 'pointer', fontWeight: 500 }}
        />
      ))}
    </Box>
  );

  return (
    <Box sx={{ pt: 2, pb: 6, px: { xs: 1, sm: 2 } }}>
      <PageHeader
        title="My Appointments"
        icon={<CalendarMonthIcon />}
        subtitle="View and manage your upcoming and past visits."
        actions={statusFilters}
      />

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearPatientError())}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {appointments.length === 0 ? (
            <Grid size={12}>
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>No appointments found</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  You haven't booked any appointments yet.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/book')}
                >
                  Book your first appointment
                </Button>
              </Card>
            </Grid>
          ) : (
            appointments.map((apt) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={apt._id}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip
                        size="small"
                        label={apt.status}
                        color={statusColors[apt.status]?.color}
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Doctor</Typography>
                          <Typography variant="body2" fontWeight={600}>{apt.doctor?.name || 'Unknown'}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonthIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Date</Typography>
                          <Typography variant="body2" fontWeight={500}>{dayjs(apt.date).format('MMM D, YYYY')}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Time</Typography>
                          <Typography variant="body2" fontWeight={500}>{apt.time}</Typography>
                        </Box>
                      </Box>

                      {apt.reason && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" display="block">Reason</Typography>
                          <Typography variant="body2">{apt.reason}</Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
};

export default Appointments;

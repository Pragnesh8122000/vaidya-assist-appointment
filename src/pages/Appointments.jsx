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
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import { getAppointments, clearPatientError } from '../features/patientAppointmentSlice';
import { STATUS_META, STATUS_ORDER, isUpcomingStatus, formatReason } from '../theme/statusTokens';

const REASON_MAX_LENGTH = 110;

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
      {STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status];
        const active = statusFilter === status;
        return (
          <Chip
            key={status}
            label={meta.label}
            onClick={() => setStatusFilter(active ? '' : status)}
            color={active ? meta.muiColor : 'default'}
            variant={active ? 'filled' : 'outlined'}
            size="small"
            sx={{
              cursor: 'pointer',
              fontWeight: 600,
              borderRadius: '999px',
              px: 0.5,
              ...(active
                ? {}
                : {
                    borderColor: 'rgba(0,0,0,0.12)',
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'action.hover' },
                  }),
            }}
          />
        );
      })}
    </Box>
  );

  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={idx}>
          <Card sx={{ p: 2, height: '100%' }}>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Skeleton variant="rounded" width={76} height={24} sx={{ borderRadius: '999px' }} />
                <Skeleton variant="circular" width={20} height={20} />
              </Box>
              <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1.5 }} />
              <Skeleton variant="text" width="90%" height={18} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderEmptyState = () => (
    <Card
      sx={{
        p: { xs: 4, sm: 6 },
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          p: 2,
          borderRadius: '50%',
          bgcolor: 'rgba(21, 101, 192, 0.10)',
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
    </Card>
  );

  return (
    <Box sx={{ pt: 2, pb: 6, px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="My Appointments"
        icon={<CalendarMonthIcon />}
        subtitle="View and manage your upcoming and past visits."
        actions={statusFilters}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearPatientError())}>
          {error}
        </Alert>
      )}

      {loading ? (
        renderSkeletons()
      ) : appointments.length === 0 ? (
        renderEmptyState()
      ) : (
        <Grid container spacing={3}>
          {appointments.map((apt) => {
            const meta = STATUS_META[apt.status] || STATUS_META.Waiting;
            const upcoming = isUpcomingStatus(apt.status);
            const formattedReason = formatReason(apt.reason, REASON_MAX_LENGTH);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={apt._id}>
                <Card
                  sx={{
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: upcoming ? 1 : 0.82,
                    bgcolor: upcoming ? 'background.paper' : 'rgba(245, 247, 250, 0.85)',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                    '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                  }}
                >
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip
                        size="small"
                        label={meta.label}
                        sx={{
                          fontWeight: 600,
                          borderRadius: '999px',
                          color: meta.fg,
                          bgcolor: meta.bg,
                          border: 'none',
                        }}
                      />
                    </Box>

                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            p: 1,
                            borderRadius: '50%',
                            bgcolor: 'rgba(21, 101, 192, 0.08)',
                            color: 'primary.main',
                          }}
                        >
                          <PersonIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            color="text.primary"
                            sx={{ lineHeight: 1.3 }}
                          >
                            {apt.doctor?.name || 'Unknown doctor'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <CalendarMonthIcon sx={{ fontSize: 18 }} />
                        <AccessTimeIcon sx={{ fontSize: 18, ml: 0.5 }} />
                        <Typography variant="body2" fontWeight={500}>
                          {dayjs(apt.date).format('MMM D, YYYY')} · {apt.time}
                        </Typography>
                      </Box>

                      {formattedReason && (
                        <Box sx={{ mt: 'auto', pt: 0.5 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            title={formattedReason}
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.4,
                            }}
                          >
                            {formattedReason}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default Appointments;

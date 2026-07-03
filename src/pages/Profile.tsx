import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../app/store';
import { toast } from 'react-toastify';
import { getPatientProfile, updatePatientProfile, clearPatientError } from '../features/patientAppointmentSlice';
import type { RootState } from '../app/store';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import PageHeader from '../components/PageHeader';
import { GUEST_PROFILE } from '../constants/guestData';

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isGuest } = useSelector((state: RootState) => state.auth);
  const { profile, loading, error } = useSelector((state: RootState) => state.patient);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', age: '', gender: '', address: '', bloodGroup: '',
  });

  useEffect(() => {
    if (!isGuest) {
      dispatch(getPatientProfile());
    }
  }, [dispatch, isGuest]);

  useEffect(() => {
    if (isGuest) {
      setForm(GUEST_PROFILE);
    } else if (profile) {
      setForm(profile as typeof form);
    }
  }, [profile, isGuest]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearPatientError());
    try {
      await dispatch(updatePatientProfile(form)).unwrap();
      toast.success('Profile saved successfully');
    } catch (err) {
      toast.error((err as string) || 'Failed to save profile');
    }
  };

  const handleDiscard = () => {
    if (!profile) return;
    setForm(profile as typeof form);
    dispatch(clearPatientError());
    toast.info('Your changes were discarded');
  };

  // Guest banner at the top
  const guestBanner = isGuest && (
    <Alert
      severity="info"
      sx={{ mb: 3, maxWidth: 720, mx: 'auto' }}
      icon={false}
    >
      <Typography variant="body2">
        You&apos;re viewing a demo profile.{' '}
        <Box
          component="a"
          href="/login"
          onClick={(e: React.MouseEvent) => { e.preventDefault(); window.location.href = '/login'; }}
          sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
        >
          Login/Register
        </Box>{' '}
        to manage your own information.
      </Typography>
    </Alert>
  );

  return (
    <Box sx={{ pt: 2, pb: 6, px: { xs: 1, sm: 2 } }}>
      <PageHeader title="My Profile" icon={<PersonIcon />} />

      {guestBanner}

      {!isGuest && error && <Alert severity="error" sx={{ mb: 3, maxWidth: 720, mx: 'auto' }} onClose={() => { dispatch(clearPatientError()); }}>{error}</Alert>}

      <Card sx={{ maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 4 } }}>
        {/* Identity header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', color: '#fff', fontSize: 30, fontWeight: 700, mb: 1.5 }}>
            {form.name?.charAt(0) || 'P'}
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            {isGuest
              ? 'You are viewing a demo profile. Fields are read-only in guest mode.'
              : <>Update your details below. Fields marked <Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>*</Box> are required.</>}
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSave}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                disabled={isGuest}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={isGuest}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                disabled={isGuest}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                disabled={isGuest}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label="Gender"
                select
                value={form.gender || ''}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                disabled={isGuest}
              >
                <MenuItem value=""><em>Select</em></MenuItem>
                {GENDER_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Blood Group"
                select
                value={form.bloodGroup || ''}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                disabled={isGuest}
              >
                <MenuItem value=""><em>Select</em></MenuItem>
                {BLOOD_GROUP_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                disabled={isGuest}
              />
            </Grid>
          </Grid>

          {!isGuest && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Button variant="outlined" onClick={handleDiscard} disabled={loading}>
                Discard Changes
              </Button>
              <Button variant="contained" type="submit" disabled={loading} startIcon={<SaveIcon />}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
              </Button>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default Profile;
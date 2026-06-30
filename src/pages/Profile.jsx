import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getPatientProfile, updatePatientProfile, clearPatientError } from '../features/patientAppointmentSlice';
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

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.patient);
  const [form, setForm] = React.useState({
    name: '', email: '', phone: '', age: '', gender: '', address: '', bloodGroup: '',
  });

  useEffect(() => {
    dispatch(getPatientProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    dispatch(clearPatientError());
    try {
      await dispatch(updatePatientProfile(form)).unwrap();
      toast.success('Profile saved successfully');
    } catch (err) {
      toast.error(err || 'Failed to save profile');
    }
  };

  const handleDiscard = () => {
    if (!profile) return;
    setForm(profile);
    dispatch(clearPatientError());
    toast.info('Your changes were discarded');
  };

  return (
    <Box sx={{ pt: 2, pb: 6, px: { xs: 1, sm: 2 } }}>
      <PageHeader title="My Profile" icon={<PersonIcon />} />

      {error && <Alert severity="error" sx={{ mb: 3, maxWidth: 720, mx: 'auto' }} onClose={() => dispatch(clearPatientError())}>{error}</Alert>}

      <Card sx={{ maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 4 } }}>
        {/* Identity header — single source of truth; details are editable below. */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', color: '#fff', fontSize: 30, fontWeight: 700, mb: 1.5 }}>
            {profile?.name?.charAt(0) || 'P'}
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            Update your details below. Fields marked <Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>*</Box> are required.
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
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label="Gender"
                select
                value={form.gender || ''}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
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
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button variant="outlined" onClick={handleDiscard} disabled={loading}>
              Discard Changes
            </Button>
            <Button variant="contained" type="submit" disabled={loading} startIcon={<SaveIcon />}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Profile;
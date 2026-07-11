import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../app/store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { completeProfile, clearError } from '../features/authSlice';
import type { RootState } from '../app/store';

/**
 * Profile completion page shown after first-time Google Sign-In.
 * Collects required fields that Google doesn't provide (phone, age, etc.).
 */
const CompleteProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state: RootState) => state.auth);
  const [form, setForm] = useState({
    phone: user?.phone || '',
    age: '',
    gender: 'Male',
    address: '',
    bloodGroup: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (!form.phone?.trim()) {
      return;
    }

    try {
      await dispatch(completeProfile({
        phone: form.phone.trim(),
        age: form.age || undefined,
        gender: form.gender || undefined,
        address: form.address || undefined,
        bloodGroup: form.bloodGroup || undefined,
      })).unwrap();
      navigate('/');
    } catch {
      // Error toast is shown by the slice
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.8, ease: 'backOut' as const },
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Card
        component={motion.div}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        sx={{
          width: { xs: 'calc(100% - 32px)', sm: 600 },
          maxWidth: 600,
          mx: 2,
          overflow: 'visible',
          position: 'relative',
          borderTop: '4px solid #C8862A',
        }}
      >
        <Box
          component={motion.div}
          variants={logoVariants}
          initial="hidden"
          animate="visible"
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: -36,
            left: '50%',
            transform: 'translateX(-50%)',
            boxShadow: '0 4px 20px rgba(33,28,22,0.2)',
          }}
        >
          <LocalHospitalIcon sx={{ fontSize: 36, color: 'primary.contrastText' }} />
        </Box>

        <CardContent sx={{ pt: 6, px: 4, pb: 4 }}>
          <Typography
            variant="h4"
            textAlign="center"
            gutterBottom
            sx={{ fontFamily: '"Crimson Pro", Georgia, serif', fontWeight: 700 }}
          >
            Complete Your Profile
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
            We just need a few more details to finish setting up your account.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
              {String(error)}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Phone Number *"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Gender"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Blood Group"
                  value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ py: 1.5, fontSize: '1rem' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Complete Profile'}
              </Button>
              <Button
                variant="text"
                fullWidth
                size="large"
                onClick={() => navigate('/')}
                sx={{ mt: 1, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
              >
                Skip for now
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompleteProfile;
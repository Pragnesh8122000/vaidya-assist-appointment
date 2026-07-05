import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
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
import IconButton from '@mui/material/IconButton';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import Grid from '@mui/material/Grid';
import { toast } from 'react-toastify';
import { registerPatient, clearError } from '../features/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    age: '', gender: 'Male', address: '', bloodGroup: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (!form.name?.trim() || !form.email?.trim() || !form.password || !form.phone?.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await dispatch(registerPatient({ ...form, clinicId: import.meta.env.VITE_CLINIC_ID })).unwrap();
      toast.success('Account created successfully');
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: 0.3 + i * 0.1 }
    })
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, delay: 0.5 }
    },
    hover: {
      scale: 1.03,
      boxShadow: '0 8px 25px rgba(33,28,22,0.18)',
      transition: { duration: 0.2 }
    }
  };

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.8, ease: 'backOut' }
    }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible"
      sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
        bgcolor: 'background.default', py: 4 }}>
      <Card component={motion.div} variants={cardVariants} initial="hidden" animate="visible"
        sx={{ width: { xs: 'calc(100% - 32px)', sm: 600 }, maxWidth: 600, mx: 2, overflow: 'visible', position: 'relative', zIndex: 1, borderTop: '4px solid #C8862A' }}>
        <Box component={motion.div} variants={logoVariants} initial="hidden" animate="visible"
          sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'primary.main',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: -36, left: '50%',
            transform: 'translateX(-50%)', boxShadow: '0 4px 20px rgba(33,28,22,0.2)' }}>
          <LocalHospitalIcon sx={{ fontSize: 36, color: 'primary.contrastText' }} />
        </Box>
        <CardContent sx={{ pt: 6, px: 4, pb: 4 }}>
          <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontFamily: '"Crimson Pro", Georgia, serif', fontWeight: 700 }}>Create your account</Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mb: 3 }}>Join Vaidya Patient Portal</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <motion.div variants={inputVariants} custom={0}>
                  <TextField fullWidth label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> } }} />
                </motion.div>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <motion.div variants={inputVariants} custom={1}>
                  <TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> } }} />
                </motion.div>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <motion.div variants={inputVariants} custom={2}>
                  <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                    slotProps={{ input: {
                      startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                      endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                    } }} />
                </motion.div>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <motion.div variants={inputVariants} custom={3}>
                  <TextField fullWidth label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                </motion.div>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <motion.div variants={inputVariants} custom={4}>
                  <TextField fullWidth label="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                </motion.div>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <motion.div variants={inputVariants} custom={5}>
                  <TextField fullWidth label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
                </motion.div>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <motion.div variants={inputVariants} custom={6}>
                  <TextField fullWidth label="Blood Group" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
                </motion.div>
              </Grid>
              <Grid size={12}>
                <motion.div variants={inputVariants} custom={7}>
                  <TextField fullWidth label="Address" multiline rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </motion.div>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <motion.div variants={buttonVariants} initial="hidden" animate="visible" whileHover="hover">
                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ py: 1.5, fontSize: '1rem' }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Register Now'}
                </Button>
              </motion.div>
            </Box>
          </Box>

          <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
            Already have an account?{' '}<Link to="/login" style={{ color: '#3D5A4C', fontWeight: 600 }}>Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;

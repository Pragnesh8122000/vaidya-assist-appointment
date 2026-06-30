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
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MuiLink from '@mui/material/Link';
import { toast } from 'react-toastify';
import { login, clearError } from '../features/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    if (!form.email || !form.password) {
      toast.error('Please enter email and password');
      return;
    }
    try {
      await dispatch(login(form)).unwrap();
    } catch (err) {
      toast.error(err || 'Login failed');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast.info('To reset your password, please contact your clinic. They can issue a new one for you.');
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
      sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
        bgcolor: 'background.default' }}>
      <Card component={motion.div} variants={cardVariants} initial="hidden" animate="visible"
        sx={{ width: { xs: 'calc(100% - 32px)', sm: 420 }, maxWidth: 420, mx: 2, overflow: 'visible', position: 'relative', zIndex: 1, borderTop: '4px solid #C8862A' }}>
        <Box component={motion.div} variants={logoVariants} initial="hidden" animate="visible"
          sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'primary.main',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: -36, left: '50%',
            transform: 'translateX(-50%)', boxShadow: '0 4px 20px rgba(33,28,22,0.2)' }}>
          <LocalHospitalIcon sx={{ fontSize: 36, color: 'primary.contrastText' }} />
        </Box>
        <CardContent sx={{ pt: 6, px: 4, pb: 4 }}>
          <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontFamily: '"Crimson Pro", Georgia, serif', fontWeight: 700 }}>Welcome back</Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mb: 3 }}>Sign in to Vaidya Patient Portal</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>{error}</Alert>}

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, textAlign: 'right' }}>
            * Required fields
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <motion.div variants={inputVariants} custom={0}>
              <TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required sx={{ mb: 2 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> } }} />
            </motion.div>
            <motion.div variants={inputVariants} custom={1}>
              <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required sx={{ mb: 1 }}
                slotProps={{ input: {
                  startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                } }} />
            </motion.div>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <MuiLink href="#" onClick={handleForgotPassword} underline="hover" sx={{ fontSize: '0.875rem', color: 'primary.main', fontWeight: 600 }}>
                Forgot password?
              </MuiLink>
            </Box>
            <motion.div variants={buttonVariants} initial="hidden" animate="visible" whileHover="hover">
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ py: 1.5, fontSize: '1rem' }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </motion.div>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 3, color: 'text.secondary' }}>
            <LockOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">Your data is encrypted and secure</Typography>
          </Box>

          <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
            Don&apos;t have an account?{' '}<Link to="/register" style={{ color: '#3D5A4C', fontWeight: 600 }}>Register</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;

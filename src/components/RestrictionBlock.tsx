import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../app/store';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { exitGuestMode } from '../features/authSlice';

interface RestrictionBlockProps {
  title: string;
  body: string;
}

/**
 * A full-page/centered restriction block shown when a guest tries to access
 * a restricted route (booking, chatbot, settings writes).
 * Includes a confirmation dialog before leaving guest mode.
 */
const RestrictionBlock = ({ title, body }: RestrictionBlockProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<'login' | 'register' | null>(null);

  const handleAuthClick = (target: 'login' | 'register') => {
    setPendingTarget(target);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    dispatch(exitGuestMode());
    setConfirmOpen(false);
    if (pendingTarget === 'register') {
      navigate('/register');
    } else {
      navigate('/login');
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingTarget(null);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          px: 2,
        }}
      >
        <Card
          sx={{
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
            borderTop: '4px solid #C8862A',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 1.5,
                borderRadius: '50%',
                bgcolor: 'rgba(200, 134, 42, 0.12)',
                color: '#C8862A',
                mb: 2,
              }}
            >
              <LockIcon sx={{ fontSize: 32 }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
              {title}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {body}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => handleAuthClick('login')}
              >
                Sign In
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={() => handleAuthClick('register')}
              >
                Create Account
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Confirmation dialog before leaving guest mode */}
      <Dialog open={confirmOpen} onClose={handleCancel} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Leave Demo Mode?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            You will exit the demo and any demo data will be lost.
            {pendingTarget === 'register'
              ? ' Continue to create a new account?'
              : ' Continue to sign in with your account?'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirm}>
            {pendingTarget === 'register' ? 'Create Account' : 'Sign In'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RestrictionBlock;
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../app/store';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { exitGuestMode } from '../features/authSlice';

interface RestrictionToastProps {
  message?: string;
  onClose: () => void;
  autoDismissMs?: number;
}

/**
 * A non-intrusive info/amber banner shown when a guest clicks a restricted feature.
 * Auto-dismisses after 5 seconds. Has manual X dismiss, Sign In, and Register buttons.
 * Shows a confirmation dialog before leaving guest mode.
 */
const RestrictionToast = ({ message, onClose, autoDismissMs = 5000 }: RestrictionToastProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<'login' | 'register' | null>(null);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(handleClose, autoDismissMs);
    return () => clearTimeout(timer);
  }, [handleClose, autoDismissMs]);

  const handleAuthClick = (target: 'login' | 'register') => {
    setPendingTarget(target);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    dispatch(exitGuestMode());
    setConfirmOpen(false);
    handleClose();
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
        role="alert"
        sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          maxWidth: 520,
          width: 'calc(100% - 32px)',
          bgcolor: '#FFF8E1',
          border: '1px solid #FFE082',
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          animation: 'slideInUp 0.3s ease-out',
          '@keyframes slideInUp': {
            from: { opacity: 0, transform: 'translateX(-50%) translateY(20px)' },
            to: { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
          },
        }}
      >
        <InfoIcon sx={{ color: '#C8862A', mt: 0.25, flexShrink: 0 }} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#5C4A1E', mb: 0.5 }}>
            {message || 'This feature requires an account. Sign in or register to continue.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => handleAuthClick('login')}
              sx={{ fontSize: '0.8rem', py: 0.5 }}
            >
              Sign In
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={() => handleAuthClick('register')}
              sx={{ fontSize: '0.8rem', py: 0.5, borderColor: '#C8862A', color: '#A66B20' }}
            >
              Register
            </Button>
          </Box>
        </Box>

        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: '#8a8073', mt: -0.5, mr: -0.5 }}
          aria-label="Dismiss"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
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

export default RestrictionToast;
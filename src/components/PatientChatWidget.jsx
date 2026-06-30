import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import {
  sendPatientChatMessage,
  togglePatientChat,
  clearPatientChat,
} from '../features/patientChatSlice';

const WIDGET_SIZE = 56;
const CHAT_WIDTH = 420;
const CHAT_MAX_WIDTH = 420;
const CHAT_HEIGHT = 600;
const CHAT_MIN_GAP = 12;
const STORAGE_KEY = 'vaidya-patient-widget-position';

/** Slot labels for user-friendly hints during multi-turn conversations. */
const SLOT_LABELS = {
  doctorId: 'doctor',
  date: 'date',
  time: 'time',
  appointmentId: 'appointment',
  reason: 'reason',
  newDate: 'new date',
  newTime: 'new time',
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getDefaultPosition() {
  return {
    x: window.innerWidth - WIDGET_SIZE - 24,
    y: window.innerHeight - WIDGET_SIZE - 100,
  };
}

function loadPosition() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        return {
          x: clamp(parsed.x, 8, window.innerWidth - WIDGET_SIZE - 8),
          y: clamp(parsed.y, 8, window.innerHeight - WIDGET_SIZE - 8),
        };
      }
    }
  } catch {
    // ignore corrupt storage
  }
  return getDefaultPosition();
}

function savePosition(position) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  } catch {
    // ignore storage errors
  }
}

const PatientChatWidget = () => {
  const dispatch = useDispatch();
  const { messages, loading, error, isOpen, conversationState } = useSelector(
    (state) => state.patientChat,
  );
  const [input, setInput] = useState('');
  const [position, setPosition] = useState(() => loadPosition());
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Keep the widget inside the viewport on resize.
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: clamp(prev.x, 8, window.innerWidth - WIDGET_SIZE - 8),
        y: clamp(prev.y, 8, window.innerHeight - WIDGET_SIZE - 8),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persist position changes.
  useEffect(() => {
    savePosition(position);
  }, [position]);

  const handlePointerDown = useCallback((e) => {
    if (e.button !== undefined && e.button !== 0) return;

    e.preventDefault();
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    positionStartRef.current = { ...position };
    setIsDragging(true);

    const handlePointerMove = (moveEvent) => {
      const dx = moveEvent.clientX - dragStartRef.current.x;
      const dy = moveEvent.clientY - dragStartRef.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedRef.current = true;
      }

      setPosition({
        x: clamp(positionStartRef.current.x + dx, 8, window.innerWidth - WIDGET_SIZE - 8),
        y: clamp(positionStartRef.current.y + dy, 8, window.innerHeight - WIDGET_SIZE - 8),
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
  }, [position]);

  const handleClick = useCallback((e) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    dispatch(togglePatientChat());
  }, [dispatch]);

  const handleSend = () => {
    if (!input.trim()) return;
    dispatch(sendPatientChatMessage({ message: input.trim() }));
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Compute slot-fill hints from conversationState
  const missingSlotHints = conversationState?.missingSlots?.map(
    (slot) => SLOT_LABELS[slot] || slot,
  );

  // Compute chat window position so it stays inside the viewport
  const chatStyle = (() => {
    const maxWidth = Math.min(CHAT_MAX_WIDTH, window.innerWidth - 32);
    const width = Math.min(CHAT_WIDTH, maxWidth);
    const height = Math.min(CHAT_HEIGHT, window.innerHeight - 100);

    let left = position.x - width + WIDGET_SIZE;
    let top = position.y - height - CHAT_MIN_GAP;

    if (top < 8) {
      top = position.y + WIDGET_SIZE + CHAT_MIN_GAP;
    }

    left = clamp(left, 8, window.innerWidth - width - 8);
    top = clamp(top, 8, window.innerHeight - height - 8);

    return { position: 'fixed', top, left, width, height };
  })();

  return (
    <>
      {/* Draggable floating toggle button */}
      <Fab
        color="secondary"
        aria-label="Open health assistant chat"
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        sx={{
          position: 'fixed',
          top: position.y,
          left: position.x,
          zIndex: 1300,
          touchAction: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
          '&.Mui-focusVisible': {
            outline: '3px solid currentColor',
            outlineOffset: '3px',
            boxShadow: 6,
          },
        }}
      >
        <MedicalServicesIcon />
      </Fab>

      {/* Chat window */}
      {isOpen && (
        <Card
          sx={{
            ...chatStyle,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1300,
            boxShadow: 6,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalHospitalIcon sx={{ fontSize: 22 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Health Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85, lineHeight: 1.2 }}>
                  Appointments & health info
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => dispatch(clearPatientChat())}
                title="Clear conversation"
                sx={{ color: 'secondary.contrastText' }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => dispatch(togglePatientChat())}
                sx={{ color: 'secondary.contrastText' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Medical disclaimer */}
          <Box
            sx={{
              px: 2,
              py: 0.75,
              bgcolor: 'warning.light',
              borderBottom: 1,
              borderColor: 'warning.main',
            }}
          >
            <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 500, lineHeight: 1.4 }}>
              ⚠️ For informational purposes only — not medical advice. Always consult a healthcare professional.
            </Typography>
          </Box>

          {/* Messages area */}
          <CardContent
            sx={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              p: 2,
              minHeight: 200,
              '&:last-child': { pb: 2 },
            }}
          >
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <MedicalServicesIcon sx={{ fontSize: 36, color: 'secondary.light', mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  How can I help you today?
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Book appointments · Check schedule · Health info
                </Typography>
              </Box>
            )}

            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isEmergency = msg.isEmergency;

              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Paper
                    elevation={isEmergency ? 3 : 0}
                    sx={{
                      px: 1.5,
                      py: 1,
                      maxWidth: '85%',
                      borderRadius: isUser
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      bgcolor: isEmergency
                        ? 'error.main'
                        : isUser
                          ? 'secondary.main'
                          : 'action.hover',
                      color: isEmergency
                        ? 'error.contrastText'
                        : isUser
                          ? 'secondary.contrastText'
                          : 'text.primary',
                    }}
                  >
                    {isEmergency && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <WarningAmberIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
                          EMERGENCY
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {msg.content}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}

            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                <CircularProgress size={14} />
                <Typography variant="body2" color="text.secondary">
                  Thinking…
                </Typography>
              </Box>
            )}

            {error && (
              <Paper
                sx={{
                  px: 1.5,
                  py: 1,
                  bgcolor: 'error.light',
                  color: 'error.contrastText',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2">{error}</Typography>
              </Paper>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Slot-fill hint — show what info the agent still needs */}
          {missingSlotHints && missingSlotHints.length > 0 && !loading && (
            <Box
              sx={{
                px: 2,
                py: 0.75,
                bgcolor: 'secondary.light',
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'secondary.dark' }}>
                Needed:
              </Typography>
              {missingSlotHints.map((hint) => (
                <Chip
                  key={hint}
                  label={hint}
                  size="small"
                  variant="outlined"
                  color="secondary"
                  sx={{ fontSize: '0.7rem', height: 22 }}
                />
              ))}
            </Box>
          )}

          {/* Quick actions */}
          <Box
            sx={{
              px: 1.5,
              pt: 1,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              gap: 0.75,
              flexWrap: 'wrap',
              overflowX: 'auto',
              scrollbarWidth: 'thin',
              '::-webkit-scrollbar': { height: 4 },
            }}
          >
            {[
              'Book appointment',
              'My appointments',
              'List doctors',
              'Cancel appointment',
              'Reschedule appointment',
            ].map((label) => (
              <Chip
                key={label}
                label={label}
                size="small"
                variant="outlined"
                color="secondary"
                disabled={loading}
                tabIndex={0}
                onClick={() => dispatch(sendPatientChatMessage({ message: label }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dispatch(sendPatientChatMessage({ message: label }));
                  }
                }}
                sx={{
                  fontSize: '0.7rem',
                  height: 24,
                  borderRadius: 1.5,
                  cursor: loading ? 'default' : 'pointer',
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'secondary.main',
                    outlineOffset: '2px',
                  },
                }}
              />
            ))}
          </Box>

          {/* Input area */}
          <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              multiline
              maxRows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
            <IconButton
              color="secondary"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              sx={{
                bgcolor: 'secondary.main',
                color: 'white',
                borderRadius: '50%',
                '&:hover': { bgcolor: 'secondary.dark' },
                '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
                width: 40,
                height: 40,
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Card>
      )}
    </>
  );
};

export default PatientChatWidget;
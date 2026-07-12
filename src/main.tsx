import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App';

// PERF-6: LocalizationProvider + AdapterDayjs moved into BookAppointment (the
// only page that renders a MUI DatePicker) so the date-pickers adapter no longer
// ships to unauthenticated Login/Register visitors.

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

if (!googleClientId) {
  console.warn('[Vaidya] VITE_GOOGLE_CLIENT_ID is not set — Google Sign-In will not work.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
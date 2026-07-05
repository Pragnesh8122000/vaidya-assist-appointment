import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App';

// PERF-6: LocalizationProvider + AdapterDayjs moved into BookAppointment (the
// only page that renders a MUI DatePicker) so the date-pickers adapter no longer
// ships to unauthenticated Login/Register visitors.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
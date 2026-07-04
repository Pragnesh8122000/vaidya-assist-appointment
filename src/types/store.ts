/**
 * Root state and dispatch types for the Redux store.
 * Slices that are still in JS (ui, patient, patientChat) use explicit
 * interface definitions so the entire tree is typed.
 */
import type { AuthState } from './auth';

export interface UiState {
  darkMode: boolean;
  sidebarOpen: boolean;
}

/**
 * Appointment status values produced by the backend `Appointment.status` enum.
 * Audit FE-4 / §3.2 (OQ#3=Option B): `Confirmed` is a real backend status, so
 * the union includes it. Keep this in sync with
 * `vaidya-assist-be/src/models/Appointment.js`.
 */
export type AppointmentStatus =
  | 'Waiting'
  | 'Confirmed'
  | 'In Consultation'
  | 'Completed'
  | 'Cancelled';

/**
 * Who a visit is for. `patient` always remains the registered portal user (the
 * booker) so ownership checks stay valid; `bookedFor` records the actual subject.
 * Audit FE-6: the booking payload uses this non-standard shape instead of a
 * flat `dependentId` — documented here as the shared contract.
 */
export interface BookedFor {
  type: 'myself' | 'dependent';
  dependentId?: string | null;
  dependentName?: string;
}

/**
 * A doctor as returned by the patient-portal `/doctors` endpoint.
 * Audit FE-10: replaces the `Record<string, unknown>` + `as string` casts used
 * throughout the booking flow.
 */
export interface Doctor {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: { slug: string; name?: string };
  clinicId?: string;
}

/**
 * A dependent on the patient's profile (book-for-someone-else, audit #22).
 */
export interface Dependent {
  _id: string;
  name: string;
  relation?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
}

/**
 * An appointment as returned by the patient-portal endpoints.
 * Audit FE-8: this is the canonical real-appointment interface — the
 * `Appointments` page no longer double-casts through `GuestAppointment`.
 */
export interface Appointment {
  _id: string;
  patient?: { _id: string; name?: string; phone?: string };
  doctor?: { _id: string; name?: string; email?: string };
  date: string;
  time: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  bookedFor?: BookedFor;
  prescription?: unknown;
}

/**
 * Payload for `bookAppointment`. Audit FE-5: the patient-portal booking
 * endpoint takes `time` (not `slot`/`slotId`) and derives `patient` from the
 * JWT — `patientId` is intentionally NOT sent. Documented here as the contract.
 */
export interface BookingPayload {
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM 24-hour
  reason?: string;
  bookedFor: BookedFor;
}

/**
 * Navigation state passed into `/book` (e.g. from a doctor card "Book with me"
 * link). Audit FE-12: previously untyped `Record<string, string>`.
 */
export interface BookAppointmentNavState {
  doctorId?: string;
}

export interface PatientState {
  profile: Record<string, unknown> | null;
  doctors: Doctor[];
  appointments: Appointment[];
  slots: {
    doctorId: string;
    date: string;
    items: { time: string; available: boolean }[];
  } | null;
  slotsLoading: boolean;
  actionLoadingId: string | null;
  prescription: Record<string, unknown> | null;
  prescriptionLoading: boolean;
  dependents: Dependent[];
  dependentsLoading: boolean;
  loading: boolean;
  error: string | null;
}

export interface PatientChatState {
  messages: Record<string, unknown>[];
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  conversationState: Record<string, unknown> | null;
}

export interface RootState {
  auth: AuthState;
  ui: UiState;
  patient: PatientState;
  patientChat: PatientChatState;
}

// Re-export AuthState for convenience
export type { AuthState };
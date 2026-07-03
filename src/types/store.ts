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

export interface PatientState {
  profile: Record<string, unknown> | null;
  doctors: Record<string, unknown>[];
  appointments: Record<string, unknown>[];
  slots: {
    doctorId: string;
    date: string;
    items: { time: string; available: boolean }[];
  } | null;
  slotsLoading: boolean;
  actionLoadingId: string | null;
  prescription: Record<string, unknown> | null;
  prescriptionLoading: boolean;
  dependents: Record<string, unknown>[];
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
import type { PayloadAction } from '@reduxjs/toolkit';

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

export const getPatientProfile: import('@reduxjs/toolkit').AsyncThunk<unknown, void, Record<string, unknown>>;
export const updatePatientProfile: import('@reduxjs/toolkit').AsyncThunk<unknown, Record<string, unknown>, Record<string, unknown>>;
export const getDoctors: import('@reduxjs/toolkit').AsyncThunk<unknown[], string | undefined, Record<string, unknown>>;
export const getAvailableSlots: import('@reduxjs/toolkit').AsyncThunk<unknown, { doctorId: string; date: string }, Record<string, unknown>>;
export const bookAppointment: import('@reduxjs/toolkit').AsyncThunk<unknown, Record<string, unknown>, Record<string, unknown>>;
export const getAppointments: import('@reduxjs/toolkit').AsyncThunk<unknown[], Record<string, unknown>, Record<string, unknown>>;
export const cancelAppointment: import('@reduxjs/toolkit').AsyncThunk<unknown, string, Record<string, unknown>>;
export const rescheduleAppointment: import('@reduxjs/toolkit').AsyncThunk<unknown, { id: string; date: string; time: string }, Record<string, unknown>>;
export const getPrescription: import('@reduxjs/toolkit').AsyncThunk<unknown, string, Record<string, unknown>>;
export const getDependents: import('@reduxjs/toolkit').AsyncThunk<unknown[], void, Record<string, unknown>>;
export const addDependent: import('@reduxjs/toolkit').AsyncThunk<unknown[], Record<string, unknown>, Record<string, unknown>>;
export const updateDependent: import('@reduxjs/toolkit').AsyncThunk<unknown[], { id: string } & Record<string, unknown>, Record<string, unknown>>;
export const removeDependent: import('@reduxjs/toolkit').AsyncThunk<unknown[], string, Record<string, unknown>>;
export const clearPatientError: () => PayloadAction<void>;
export const clearSlots: () => PayloadAction<void>;
export const clearPrescription: () => PayloadAction<void>;

const patientSlice: import('@reduxjs/toolkit').Slice<PatientState>;
export default patientSlice.reducer;
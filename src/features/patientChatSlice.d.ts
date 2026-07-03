import type { PayloadAction } from '@reduxjs/toolkit';

export interface PatientChatState {
  messages: Record<string, unknown>[];
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  conversationState: Record<string, unknown> | null;
}

export const sendPatientChatMessage: import('@reduxjs/toolkit').AsyncThunk<unknown, { message: string }, Record<string, unknown>>;
export const togglePatientChat: () => PayloadAction<void>;
export const openPatientChat: () => PayloadAction<void>;
export const closePatientChat: () => PayloadAction<void>;
export const clearPatientChat: () => PayloadAction<void>;
export const clearPatientError: () => PayloadAction<void>;

const patientChatSlice: import('@reduxjs/toolkit').Slice<PatientChatState>;
export default patientChatSlice.reducer;
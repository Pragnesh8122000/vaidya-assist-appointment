import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import uiReducer from '../features/uiSlice';
import patientReducer from '../features/patientAppointmentSlice';
import patientChatReducer from '../features/patientChatSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    patient: patientReducer,
    patientChat: patientChatReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export default store;

// Use the hand-crafted RootState from types/store.ts for full type safety
// (the inferred type would be `unknown` for JS slices).
export type { RootState } from '../types/store';
export type AppDispatch = typeof store.dispatch;
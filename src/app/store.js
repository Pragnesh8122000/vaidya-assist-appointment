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

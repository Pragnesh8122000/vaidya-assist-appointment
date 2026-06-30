import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../api/axios';

export const getPatientProfile = createAsyncThunk('patient:getProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/patient-portal/me');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updatePatientProfile = createAsyncThunk('patient:updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/patient-portal/me', profileData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
  }
});

export const getDoctors = createAsyncThunk('patient:getDoctors', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/doctors');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors');
  }
});

export const bookAppointment = createAsyncThunk('patient:bookAppointment', async (aptData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/patient-portal/appointments', aptData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Booking failed');
  }
});

export const getAppointments = createAsyncThunk('patient:getAppointments', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/patient-portal/appointments', { params });
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
  }
});

const patientSlice = createSlice({
  name: 'patient',
  initialState: {
    profile: null,
    doctors: [],
    appointments: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPatientError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPatientProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(getDoctors.fulfilled, (state, action) => {
        state.doctors = action.payload;
      })
      .addCase(getAppointments.fulfilled, (state, action) => {
        state.appointments = action.payload;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        // Optimistically add the new appointment so the list renders immediately
        // after navigation, before the next full fetch completes.
        state.appointments = [action.payload, ...state.appointments];
        toast.success('Appointment booked successfully');
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
          toast.error(action.payload || 'Something went wrong');
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => { state.loading = false; }
      );
  },
});

export const { clearPatientError } = patientSlice.actions;
export default patientSlice.reducer;

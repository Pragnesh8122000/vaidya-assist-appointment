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

export const getDoctors = createAsyncThunk('patient:getDoctors', async (search, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/patient-portal/doctors', {
      params: search ? { search } : undefined,
    });
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors');
  }
});

export const getAvailableSlots = createAsyncThunk('patient:getSlots', async ({ doctorId, date }, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/patient-portal/doctors/${doctorId}/slots`, {
      params: { date },
    });
    return data.data; // { date, doctorId, doctorName, slots: [{ time, available }] }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load available time slots');
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

export const cancelAppointment = createAsyncThunk('patient:cancelAppointment', async (appointment, { rejectWithValue }) => {
  try {
    const id = appointment.displayId || appointment._id;
    const { data } = await api.put(`/patient-portal/appointments/${id}/cancel`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment');
  }
});

export const rescheduleAppointment = createAsyncThunk('patient:rescheduleAppointment', async ({ appointment, date, time }, { rejectWithValue }) => {
  try {
    const id = appointment.displayId || appointment._id;
    const { data } = await api.patch(`/patient-portal/appointments/${id}/reschedule`, { date, time });
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to reschedule appointment');
  }
});

// Fetch the prescription for a completed visit (structured medications, with a
// scanned-file fallback). See audit #23.
export const getPrescription = createAsyncThunk('patient:getPrescription', async (appointmentOrId, { rejectWithValue }) => {
  try {
    const id = typeof appointmentOrId === 'object'
      ? (appointmentOrId.displayId || appointmentOrId._id)
      : appointmentOrId;
    const { data } = await api.get(`/patient-portal/appointments/${id}/prescription`);
    return data.data; // { appointment, prescription, files }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load prescription');
  }
});

// Dependents (book-for-someone-else, audit #22). The backend stores dependents
// inside the patient's own profile and returns the full list on every mutation.
export const getDependents = createAsyncThunk('patient:getDependents', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/patient-portal/me/dependents');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load dependents');
  }
});

export const addDependent = createAsyncThunk('patient:addDependent', async (dependent, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/patient-portal/me/dependents', dependent);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add dependent');
  }
});

export const updateDependent = createAsyncThunk('patient:updateDependent', async ({ id, ...fields }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/patient-portal/me/dependents/${id}`, fields);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update dependent');
  }
});

export const removeDependent = createAsyncThunk('patient:removeDependent', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/patient-portal/me/dependents/${id}`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to remove dependent');
  }
});

const patientSlice = createSlice({
  name: 'patient',
  initialState: {
    profile: null,
    doctors: [],
    appointments: [],
    // Available slot grid for the currently selected doctor+date in the booking flow.
    slots: null, // { doctorId, date, items: [{ time, available }] }
    slotsLoading: false,
    // Track in-flight cancel/reschedule per appointment so individual cards show state.
    actionLoadingId: null,
    // Prescription view (#23): { appointment, prescription, files }
    prescription: null,
    prescriptionLoading: false,
    // Dependents for the "booking for" selector (#22).
    dependents: [],
    dependentsLoading: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearPatientError: (state) => { state.error = null; },
    clearSlots: (state) => { state.slots = null; },
    clearPrescription: (state) => { state.prescription = null; },
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
      .addCase(getAvailableSlots.pending, (state) => {
        state.slotsLoading = true;
      })
      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.slots = {
          doctorId: action.payload.doctorId,
          date: action.payload.date,
          items: action.payload.slots,
        };
      })
      .addCase(getAvailableSlots.rejected, (state) => {
        state.slotsLoading = false;
        state.slots = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        // Optimistically add the new appointment so the list renders immediately
        // after navigation, before the next full fetch completes.
        state.appointments = [action.payload, ...state.appointments];
        toast.success('Appointment booked successfully');
      })
      .addCase(cancelAppointment.pending, (state, action) => {
        const apt = action.meta.arg;
        state.actionLoadingId = apt?.displayId || apt?._id || apt;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        const updated = action.payload;
        const key = updated.displayId || updated._id;
        state.appointments = state.appointments.map((apt) =>
          (apt.displayId || apt._id) === key ? updated : apt
        );
        toast.success('Appointment cancelled');
      })
      .addCase(cancelAppointment.rejected, (state) => {
        state.actionLoadingId = null;
      })
      .addCase(rescheduleAppointment.pending, (state, action) => {
        const apt = action.meta.arg.appointment;
        state.actionLoadingId = apt?.displayId || apt?._id || action.meta.arg.id;
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        const updated = action.payload;
        const key = updated.displayId || updated._id;
        state.appointments = state.appointments.map((apt) =>
          (apt.displayId || apt._id) === key ? updated : apt
        );
        toast.success('Appointment rescheduled');
      })
      .addCase(rescheduleAppointment.rejected, (state) => {
        state.actionLoadingId = null;
      })
      .addCase(getPrescription.pending, (state) => {
        state.prescriptionLoading = true;
        state.prescription = null;
      })
      .addCase(getPrescription.fulfilled, (state, action) => {
        state.prescriptionLoading = false;
        state.prescription = action.payload;
      })
      .addCase(getPrescription.rejected, (state) => {
        state.prescriptionLoading = false;
        state.prescription = null;
      })
      .addCase(getDependents.pending, (state) => {
        state.dependentsLoading = true;
      })
      .addCase(getDependents.fulfilled, (state, action) => {
        state.dependentsLoading = false;
        state.dependents = action.payload;
      })
      .addCase(getDependents.rejected, (state) => {
        state.dependentsLoading = false;
      })
      // add/update/remove all return the full refreshed dependents list.
      .addCase(addDependent.fulfilled, (state, action) => {
        state.dependents = action.payload;
        toast.success('Dependent added');
      })
      .addCase(updateDependent.fulfilled, (state, action) => {
        state.dependents = action.payload;
        toast.success('Dependent updated');
      })
      .addCase(removeDependent.fulfilled, (state, action) => {
        state.dependents = action.payload;
        toast.success('Dependent removed');
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

export const { clearPatientError, clearSlots, clearPrescription } = patientSlice.actions;
export default patientSlice.reducer;
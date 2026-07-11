import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { GUEST_USER } from '../constants/guestData';
import type { AuthState, User } from '../types/auth';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerPatient = createAsyncThunk(
  'auth/registerPatient',
  async (patientData: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register-patient', patientData);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Patient registration failed');
    }
  }
);

/** Google Sign-In: sends the Google ID token to the backend for verification. */
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (idToken: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/google', { idToken, role: 'patient' });
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Google sign-in failed');
    }
  }
);

/** Complete patient profile after first-time Google Sign-In. */
export const completeProfile = createAsyncThunk(
  'auth/completeProfile',
  async (profileData: { phone: string; age?: string; gender?: string; address?: string; bloodGroup?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch('/auth/complete-profile', profileData);
      return data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Profile completion failed');
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Session expired');
    }
  }
);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isGuest: false,
  loading: false,
  error: null,
  profileComplete: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isGuest = false;
      state.profileComplete = true;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    enterGuestMode: (state) => {
      state.user = GUEST_USER;
      state.isAuthenticated = true;
      state.isGuest = true;
      state.loading = false;
      state.error = null;
    },
    exitGuestMode: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isGuest = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user ?? null;
        state.profileComplete = action.payload?.profileComplete ?? true;
        toast.success('Welcome back!');
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : null;
        toast.error(typeof action.payload === 'string' ? action.payload : 'Login failed');
      })
      .addCase(registerPatient.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user ?? null;
        state.profileComplete = true;
        toast.success('Account created successfully');
      })
      .addCase(registerPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : null;
        toast.error(typeof action.payload === 'string' ? action.payload : 'Registration failed');
      })
      .addCase(googleLogin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user ?? null;
        state.profileComplete = action.payload?.profileComplete ?? true;
        if (state.profileComplete) {
          toast.success('Welcome back!');
        }
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : null;
        toast.error(typeof action.payload === 'string' ? action.payload : 'Google sign-in failed');
      })
      .addCase(completeProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(completeProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user ?? state.user;
        state.profileComplete = true;
        toast.success('Profile completed successfully');
      })
      .addCase(completeProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : null;
        toast.error(typeof action.payload === 'string' ? action.payload : 'Profile completion failed');
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload as User;
        // Rehydrate profileComplete from the server so page-refresh doesn't
        // reset incomplete-profile users back to the default (true).
        state.profileComplete = action.payload?.profileComplete ?? true;
      })
      .addCase(getMe.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      });
  },
});

export const { logout, clearError, enterGuestMode, exitGuestMode } = authSlice.actions;
export default authSlice.reducer;
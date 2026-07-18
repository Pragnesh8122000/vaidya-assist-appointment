import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  login,
  getMe,
  enterGuestMode,
  exitGuestMode,
  clearError,
} from './authSlice';

vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const makeStore = () => configureStore({ reducer: { auth: authReducer } });

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('enters guest mode', () => {
    const store = makeStore();
    store.dispatch(enterGuestMode());
    const state = store.getState().auth;
    expect(state.isGuest).toBe(true);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe('Guest User');
  });

  it('exits guest mode and clears tokens', () => {
    const store = makeStore();
    store.dispatch(enterGuestMode());
    store.dispatch(exitGuestMode());
    const state = store.getState().auth;
    expect(state.isGuest).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('clears errors', () => {
    const store = makeStore();
    store.dispatch(clearError());
    expect(store.getState().auth.error).toBeNull();
  });

  it('persists tokens on login success', async () => {
    const api = (await import('../api/axios')).default;
    (api.post as any).mockResolvedValueOnce({
      data: { data: { token: 't1', refreshToken: 'r1', user: { name: 'A' }, profileComplete: true } },
    });

    const store = makeStore();
    await store.dispatch(login({ email: 'a@b.c', password: 'pw' })).unwrap();

    expect(localStorage.getItem('token')).toBe('t1');
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  it('sets error on login failure', async () => {
    const api = (await import('../api/axios')).default;
    (api.post as any).mockRejectedValueOnce({ response: { data: { message: 'Bad creds' } } });

    const store = makeStore();
    const result = await store.dispatch(login({ email: 'a@b.c', password: 'pw' }));

    expect(result.type).toBe('auth/login/rejected');
    expect(store.getState().auth.error).toBe('Bad creds');
  });

  it('rehydrates profileComplete from getMe', async () => {
    const api = (await import('../api/axios')).default;
    (api.get as any).mockResolvedValueOnce({
      data: { data: { _id: 'u1', name: 'A', profileComplete: false } },
    });

    const store = makeStore();
    await store.dispatch(getMe()).unwrap();

    expect(store.getState().auth.profileComplete).toBe(false);
  });
});

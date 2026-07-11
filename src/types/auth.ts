/**
 * TypeScript interfaces for the auth slice and guest mode.
 * Auth state is stored in Redux (memory-only for guests).
 */

export interface UserRole {
  name: string;
  slug: string;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  age?: number | string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  role?: UserRole;
  clinicId?: string;
  authProvider?: 'password' | 'google' | 'both';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  loading: boolean;
  error: string | null;
  /** False when a Google-sign-up patient hasn't completed their profile yet. */
  profileComplete: boolean;
}
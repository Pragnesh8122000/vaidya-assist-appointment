/**
 * Guest-mode constants — all dummy data lives here.
 * No backend calls are made when isGuest is true.
 */
import type { User } from '../types/auth';

export const GUEST_USER: User = {
  name: 'Guest User',
  email: 'guest@vaidya.com',
  phone: '0000000000',
  age: 30,
  gender: 'Male',
  bloodGroup: 'O+',
  address: 'Demo Address, City',
  role: { name: 'Guest', slug: 'guest' },
};

export interface GuestProfile {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  bloodGroup: string;
  address: string;
}

export const GUEST_PROFILE: GuestProfile = {
  name: 'Guest User',
  email: 'guest@vaidya.com',
  phone: '0000000000',
  age: '30',
  gender: 'Male',
  bloodGroup: 'O+',
  address: 'Demo Address, City',
};

export interface GuestDoctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface GuestAppointment {
  _id: string;
  doctor: GuestDoctor;
  date: string;
  time: string;
  reason: string;
  status: string;
  bookedFor: { type: string };
}

export const GUEST_APPOINTMENTS: GuestAppointment[] = [
  {
    _id: 'guest-apt-1',
    doctor: { _id: 'guest-doc-1', name: 'Dr. Rajesh Sharma', email: 'rajesh@vaidya.com', phone: '+91-98765-43210' },
    date: '2026-07-15',
    time: '10:30',
    reason: 'Routine checkup',
    status: 'Waiting',
    bookedFor: { type: 'myself' },
  },
  {
    _id: 'guest-apt-2',
    doctor: { _id: 'guest-doc-2', name: 'Dr. Priya Patel', email: 'priya@vaidya.com', phone: '+91-98765-43211' },
    date: '2026-06-28',
    time: '14:00',
    reason: 'Follow-up consultation',
    status: 'Completed',
    bookedFor: { type: 'myself' },
  },
  {
    _id: 'guest-apt-3',
    doctor: { _id: 'guest-doc-3', name: 'Dr. Vikram Singh', email: 'vikram@vaidya.com', phone: '+91-98765-43212' },
    date: '2026-06-10',
    time: '11:00',
    reason: 'Headache and dizziness',
    status: 'Completed',
    bookedFor: { type: 'myself' },
  },
  {
    _id: 'guest-apt-4',
    doctor: { _id: 'guest-doc-1', name: 'Dr. Rajesh Sharma', email: 'rajesh@vaidya.com', phone: '+91-98765-43210' },
    date: '2026-05-20',
    time: '09:00',
    reason: 'Seasonal allergy consultation',
    status: 'Completed',
    bookedFor: { type: 'myself' },
  },
];

export interface GuestDashboardStats {
  nextAppointment: {
    date: string;
    time: string;
    doctor: string;
    specialty: string;
    reason: string;
  };
  pastVisits: {
    date: string;
    doctor: string;
    reason: string;
  }[];
  profileStatus: string;
  completedCount: number;
}

export const GUEST_DASHBOARD_STATS: GuestDashboardStats = {
  nextAppointment: {
    date: '2026-07-15',
    time: '10:30',
    doctor: 'Dr. Anita Desai',
    specialty: 'General Physician',
    reason: 'Routine checkup',
  },
  pastVisits: [
    {
      date: '2026-06-28',
      doctor: 'Dr. Priya Patel',
      reason: 'Follow-up consultation',
    },
    {
      date: '2026-06-10',
      doctor: 'Dr. Vikram Singh',
      reason: 'Headache and dizziness',
    },
    {
      date: '2026-05-20',
      doctor: 'Dr. Rajesh Sharma',
      reason: 'Seasonal allergy consultation',
    },
  ],
  profileStatus: 'Demo Mode',
  completedCount: 3,
};

/**
 * Restricted routes — guests cannot access these.
 * All other authenticated routes are read-only with dummy data.
 */
export const GUEST_RESTRICTED_ROUTES: string[] = ['/book', '/settings'];

export interface RestrictionMessage {
  title: string;
  body: string;
}

/**
 * Reusable restriction message configuration by route.
 */
export const GUEST_RESTRICTION_MESSAGES: Record<string, RestrictionMessage> = {
  '/book': {
    title: 'Appointment Booking Requires an Account',
    body: "You're currently exploring in demo mode. To book real appointments, please sign in or create a free account.",
  },
  '/settings': {
    title: 'Settings Requires an Account',
    body: "You're currently exploring in demo mode. To manage your settings, please sign in or create a free account.",
  },
  default: {
    title: 'This Feature Requires an Account',
    body: "You're currently exploring in demo mode. To access this feature, please sign in or create a free account.",
  },
};
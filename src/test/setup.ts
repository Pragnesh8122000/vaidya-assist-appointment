import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

if (typeof import.meta.env.VITE_API_URL === 'undefined') {
  import.meta.env.VITE_API_URL = 'http://localhost:5050/api';
}

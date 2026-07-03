import type { PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  darkMode: boolean;
  sidebarOpen: boolean;
}

export const toggleDarkMode: () => PayloadAction<void>;
export const toggleSidebar: () => PayloadAction<void>;

const uiSlice: import('@reduxjs/toolkit').Slice<UiState>;
export default uiSlice.reducer;
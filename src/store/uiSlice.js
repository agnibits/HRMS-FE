import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarCollapsed: localStorage.getItem('hrms-sidebar-collapsed') === '1',
  sidebarMobileOpen: false,
  aiOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('hrms-sidebar-collapsed', state.sidebarCollapsed ? '1' : '0');
    },
    setSidebarMobileOpen(state, action) {
      state.sidebarMobileOpen = action.payload;
    },
    setAiOpen(state, action) {
      state.aiOpen = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarMobileOpen, setAiOpen } = uiSlice.actions;
export const selectSidebarCollapsed = (s) => s.ui.sidebarCollapsed;
export const selectSidebarMobileOpen = (s) => s.ui.sidebarMobileOpen;
export const selectAiOpen = (s) => s.ui.aiOpen;

export default uiSlice.reducer;

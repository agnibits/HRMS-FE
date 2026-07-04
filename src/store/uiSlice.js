import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarCollapsed: localStorage.getItem('hrms-sidebar-collapsed') === '1',
  sidebarMobileOpen: false,
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
  },
});

export const { toggleSidebar, setSidebarMobileOpen } = uiSlice.actions;
export const selectSidebarCollapsed = (s) => s.ui.sidebarCollapsed;
export const selectSidebarMobileOpen = (s) => s.ui.sidebarMobileOpen;

export default uiSlice.reducer;

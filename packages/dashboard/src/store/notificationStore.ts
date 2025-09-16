import { create } from 'zustand';

interface NotificationState {
  unreadCount: number;
  criticalCount: number;
  setUnreadCount: (n: number) => void;
  setCriticalCount: (n: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  criticalCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setCriticalCount: (criticalCount) => set({ criticalCount }),
}));

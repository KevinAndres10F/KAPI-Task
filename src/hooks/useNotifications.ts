import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  taskId?: string;
}

interface NotificationsStore {
  notifications: AppNotification[];
  unreadCount: number;
  add: (n: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useNotifications = create<NotificationsStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  add: (n) => {
    const entry: AppNotification = {
      ...n,
      id: crypto.randomUUID(),
      read: false,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({
      notifications: [entry, ...s.notifications].slice(0, 50),
      unreadCount: s.unreadCount + 1,
    }));
  },

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  dismiss: (id) => {
    const n = get().notifications.find((x) => x.id === id);
    set((s) => ({
      notifications: s.notifications.filter((x) => x.id !== id),
      unreadCount: n && !n.read ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
    }));
  },

  clear: () => set({ notifications: [], unreadCount: 0 }),
}));

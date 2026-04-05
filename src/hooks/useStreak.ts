import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StreakStore {
  streak: number;
  lastActiveDate: string | null;   // ISO date string YYYY-MM-DD
  totalDays: number;
  checkAndUpdate: () => void;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const useStreak = create<StreakStore>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastActiveDate: null,
      totalDays: 0,

      checkAndUpdate: () => {
        const today = todayStr();
        const { lastActiveDate, streak, totalDays } = get();

        if (lastActiveDate === today) return; // already counted today

        const isConsecutive = lastActiveDate === yesterdayStr();
        set({
          streak: isConsecutive ? streak + 1 : 1,
          lastActiveDate: today,
          totalDays: totalDays + 1,
        });
      },
    }),
    { name: 'kapi-streak' }
  )
);

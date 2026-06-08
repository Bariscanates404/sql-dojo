import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Faz 0 stand-in for real auth roles. The teacher view reveals 🧑‍🏫 sections;
// the student view strips them (role-visibility rule, CURRICULUM_MASTER 5b).
// Later this will be driven by the Supabase profile.role, not a local toggle.
export type Role = 'student' | 'teacher';

interface RoleState {
  role: Role;
  setRole: (role: Role) => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: 'student',
      setRole: (role) => set({ role }),
    }),
    { name: 'sql-dojo-role' },
  ),
);

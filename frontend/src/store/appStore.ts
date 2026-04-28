import { create } from 'zustand';
import { Account, Category, Tier, Operation, Echeance } from '../types';

interface AppState {
  accounts: Account[];
  categories: Category[];
  tiers: Tier[];
  operations: Operation[];
  echeances: Echeance[];
  selectedAccountId: number | null;

  setAccounts: (accounts: Account[]) => void;
  setCategories: (categories: Category[]) => void;
  setTiers: (tiers: Tier[]) => void;
  setOperations: (operations: Operation[]) => void;
  setEcheances: (echeances: Echeance[]) => void;
  setSelectedAccountId: (id: number | null) => void;
  reset: () => void;

  upsertAccount: (account: Account) => void;
  removeAccount: (id: number) => void;
  upsertOperation: (operation: Operation) => void;
  removeOperation: (id: number) => void;
  toggleOperationStatut: (id: number) => void;
  upsertCategory: (category: Category) => void;
  removeCategory: (id: number) => void;
  upsertTier: (tier: Tier) => void;
  removeTier: (id: number) => void;
  upsertEcheance: (echeance: Echeance) => void;
  removeEcheance: (id: number) => void;
}

const CYCLE: Record<string, string> = { Aucun: 'Pointé', Pointé: 'Rapproché', Rapproché: 'Aucun' };

export const useAppStore = create<AppState>((set) => ({
  accounts: [],
  categories: [],
  tiers: [],
  operations: [],
  echeances: [],
  selectedAccountId: null,

  setAccounts: (accounts) => set({ accounts }),
  setCategories: (categories) => set({ categories }),
  setTiers: (tiers) => set({ tiers }),
  setOperations: (operations) => set({ operations }),
  setEcheances: (echeances) => set({ echeances }),
  setSelectedAccountId: (id) => set({ selectedAccountId: id }),
  reset: () => set({ accounts: [], categories: [], tiers: [], operations: [], echeances: [], selectedAccountId: null }),

  upsertAccount: (account) => set(s => ({
    accounts: s.accounts.some(a => a.id === account.id)
      ? s.accounts.map(a => a.id === account.id ? account : a)
      : [...s.accounts, account],
  })),
  removeAccount: (id) => set(s => ({ accounts: s.accounts.filter(a => a.id !== id) })),

  upsertOperation: (op) => set(s => ({
    operations: s.operations.some(o => o.id === op.id)
      ? s.operations.map(o => o.id === op.id ? op : o)
      : [...s.operations, op],
  })),
  removeOperation: (id) => set(s => ({ operations: s.operations.filter(o => o.id !== id) })),
  toggleOperationStatut: (id) => set(s => ({
    operations: s.operations.map(o =>
      o.id === id ? { ...o, statut: (CYCLE[o.statut] || 'Aucun') as any } : o
    ),
  })),

  upsertCategory: (cat) => set(s => ({
    categories: s.categories.some(c => c.id === cat.id)
      ? s.categories.map(c => c.id === cat.id ? cat : c)
      : [...s.categories, cat],
  })),
  removeCategory: (id) => set(s => ({ categories: s.categories.filter(c => c.id !== id) })),

  upsertTier: (tier) => set(s => ({
    tiers: s.tiers.some(t => t.id === tier.id)
      ? s.tiers.map(t => t.id === tier.id ? tier : t)
      : [...s.tiers, tier],
  })),
  removeTier: (id) => set(s => ({ tiers: s.tiers.filter(t => t.id !== id) })),

  upsertEcheance: (ech) => set(s => ({
    echeances: s.echeances.some(e => e.id === ech.id)
      ? s.echeances.map(e => e.id === ech.id ? ech : e)
      : [...s.echeances, ech],
  })),
  removeEcheance: (id) => set(s => ({ echeances: s.echeances.filter(e => e.id !== id) })),
}));

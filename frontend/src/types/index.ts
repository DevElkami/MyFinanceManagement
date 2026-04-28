export interface Account {
  id: number;
  name: string;
  bank: string;
  owner: string;
  soldeInitial: number;
}

export interface Category {
  id: number;
  label: string;
  type: CategoryType;
}

export type CategoryType =
  | 'Salaire' | 'Alimentation' | 'Essence' | 'Péage'
  | 'Maison' | 'Energie' | 'Voiture' | 'Divers';

export type OperationType = 'CB' | 'Virement' | 'Remise de chèque' | 'Prélèvement' | 'Chèque';
export type OperationStatut = 'Aucun' | 'Pointé' | 'Rapproché';

export interface Operation {
  id: number;
  accountId: number;
  date: string;
  amount: number;
  type: OperationType;
  tierId: number | null;
  categoryId: number | null;
  note: string;
  statut: OperationStatut;
  equilibre: boolean;
  linkedOperationId: number | null;
}

export interface Tier {
  id: number;
  label: string;
}

export interface Echeance {
  id: number;
  accountId: number;
  dayOfMonth: number;
  amount: number;
  type: OperationType;
  tierId: number | null;
  categoryId: number | null;
  note: string;
  equilibre: boolean;
  lastAppliedMonth: string | null;
}

export const OP_TYPES: OperationType[] = ['CB', 'Virement', 'Remise de chèque', 'Prélèvement', 'Chèque'];
export const STATUTS: OperationStatut[] = ['Aucun', 'Pointé', 'Rapproché'];
export const CATEGORY_TYPES: CategoryType[] = [
  'Salaire', 'Alimentation', 'Essence', 'Péage', 'Maison', 'Energie', 'Voiture', 'Divers',
];

export const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

export const fmtDate = (d: string) => {
  if (!d) return '';
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('fr-FR');
};

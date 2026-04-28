// Mock data for Finance 2026
const CATEGORIES = [
  { id: 1, label: 'Salaire', type: 'Salaire' },
  { id: 2, label: 'Courses alimentaires', type: 'Alimentation' },
  { id: 3, label: 'Restaurant', type: 'Alimentation' },
  { id: 4, label: 'Carburant', type: 'Essence' },
  { id: 5, label: 'Péage autoroute', type: 'Péage' },
  { id: 6, label: 'Loyer', type: 'Maison' },
  { id: 7, label: 'Électricité', type: 'Energie' },
  { id: 8, label: 'Gaz', type: 'Energie' },
  { id: 9, label: 'Assurance auto', type: 'Voiture' },
  { id: 10, label: 'Entretien véhicule', type: 'Voiture' },
  { id: 11, label: 'Internet', type: 'Maison' },
  { id: 12, label: 'Téléphone', type: 'Divers' },
  { id: 13, label: 'Santé', type: 'Divers' },
  { id: 14, label: 'Impôts', type: 'Divers' },
  { id: 15, label: 'Loisirs', type: 'Divers' },
];

const CATEGORY_TYPES = ['Salaire', 'Alimentation', 'Essence', 'Péage', 'Maison', 'Energie', 'Voiture', 'Divers'];

const TIERS = [
  { id: 1, label: 'Employeur SAS' },
  { id: 2, label: 'Carrefour' },
  { id: 3, label: 'Leclerc' },
  { id: 4, label: 'TotalEnergies' },
  { id: 5, label: 'VINCI Autoroutes' },
  { id: 6, label: 'Bailleur Immo' },
  { id: 7, label: 'EDF' },
  { id: 8, label: 'GRDF' },
  { id: 9, label: 'MAIF' },
  { id: 10, label: 'Garage Central' },
  { id: 11, label: 'Orange' },
  { id: 12, label: 'Free Mobile' },
  { id: 13, label: 'Mutuelle Santé' },
  { id: 14, label: 'Trésor Public' },
  { id: 15, label: 'FNAC' },
  { id: 16, label: 'Restaurant Le Bistrot' },
  { id: 17, label: 'Sécurité Sociale' },
];

const OP_TYPES = ['CB', 'Virement', 'Remise de chèque', 'Prélèvement', 'Chèque'];
const STATUTS = ['Aucun', 'Pointé', 'Rapproché'];

function generateOperations(accountId, count, startDate) {
  const ops = [];
  const d = new Date(startDate);
  for (let i = 0; i < count; i++) {
    const day = new Date(d);
    day.setDate(day.getDate() + Math.floor(i * 1.2));
    const isCredit = Math.random() < 0.2;
    const cat = isCredit ? CATEGORIES[0] : CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1];
    const tier = isCredit ? TIERS[0] : TIERS[Math.floor(Math.random() * (TIERS.length - 1)) + 1];
    const amount = isCredit
      ? +(2000 + Math.random() * 1500).toFixed(2)
      : -(10 + Math.random() * 400).toFixed(2);
    ops.push({
      id: accountId * 1000 + i,
      date: day.toISOString().slice(0, 10),
      amount: +amount,
      type: isCredit ? 'Virement' : OP_TYPES[Math.floor(Math.random() * OP_TYPES.length)],
      tierId: tier.id,
      categoryId: cat.id,
      note: '',
      statut: STATUTS[Math.floor(Math.random() * 2)],
      equilibre: true,
      creditDebit: isCredit ? 'credit' : 'debit',
      accountId,
    });
  }
  ops.sort((a, b) => a.date.localeCompare(b.date));
  return ops;
}

const INITIAL_ACCOUNTS = [
  { id: 1, name: 'Compte Courant', bank: 'Banque Populaire', owner: 'Jean Dupont', soldeInitial: 1500.00 },
  { id: 2, name: 'Compte Joint', bank: 'Crédit Agricole', owner: 'Marie Dupont', soldeInitial: 2200.00 },
  { id: 3, name: 'Livret A', bank: 'Banque Populaire', owner: 'Jean Dupont', soldeInitial: 8500.00 },
];

const INITIAL_OPERATIONS = [
  ...generateOperations(1, 45, '2026-01-05'),
  ...generateOperations(2, 40, '2026-01-03'),
  ...generateOperations(3, 8, '2026-01-15'),
];

const INITIAL_ECHEANCES = [
  { id: 1, accountId: 1, date: '2026-01-05', amount: -750, type: 'Prélèvement', tierId: 6, categoryId: 6, note: 'Loyer mensuel', creditDebit: 'debit', equilibre: true },
  { id: 2, accountId: 1, date: '2026-01-10', amount: -85, type: 'Prélèvement', tierId: 7, categoryId: 7, note: 'Facture EDF', creditDebit: 'debit', equilibre: true },
  { id: 3, accountId: 1, date: '2026-01-15', amount: -45, type: 'Prélèvement', tierId: 11, categoryId: 11, note: 'Abonnement Internet', creditDebit: 'debit', equilibre: true },
  { id: 4, accountId: 2, date: '2026-01-08', amount: -55, type: 'Prélèvement', tierId: 9, categoryId: 9, note: 'Assurance auto', creditDebit: 'debit', equilibre: true },
];

Object.assign(window, {
  CATEGORIES, CATEGORY_TYPES, TIERS, OP_TYPES, STATUTS,
  INITIAL_ACCOUNTS, INITIAL_OPERATIONS, INITIAL_ECHEANCES,
});

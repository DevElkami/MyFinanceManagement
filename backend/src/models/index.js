const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  login: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING(255), field: 'password_hash', allowNull: false },
  createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW },
}, { tableName: 'users', timestamps: false });

const Account = sequelize.define('Account', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, field: 'user_id', allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  bank: DataTypes.STRING(100),
  owner: DataTypes.STRING(100),
  soldeInitial: { type: DataTypes.DECIMAL(12, 2), field: 'solde_initial', defaultValue: 0 },
}, { tableName: 'accounts', timestamps: false });

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, field: 'user_id', allowNull: false },
  label: { type: DataTypes.STRING(100), allowNull: false },
  type: {
    type: DataTypes.ENUM('Salaire', 'Alimentation', 'Essence', 'Péage', 'Maison', 'Energie', 'Voiture', 'Divers'),
    defaultValue: 'Divers',
  },
}, { tableName: 'categories', timestamps: false });

const Tier = sequelize.define('Tier', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, field: 'user_id', allowNull: false },
  label: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'tiers', timestamps: false });

const Operation = sequelize.define('Operation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  accountId: { type: DataTypes.INTEGER, field: 'account_id', allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  type: {
    type: DataTypes.ENUM('CB', 'Virement', 'Remise de chèque', 'Prélèvement', 'Chèque'),
    allowNull: false,
  },
  tierId: { type: DataTypes.INTEGER, field: 'tier_id', allowNull: true },
  categoryId: { type: DataTypes.INTEGER, field: 'category_id', allowNull: true },
  note: { type: DataTypes.TEXT, defaultValue: '' },
  statut: { type: DataTypes.ENUM('Aucun', 'Pointé', 'Rapproché'), defaultValue: 'Aucun' },
  equilibre: { type: DataTypes.BOOLEAN, defaultValue: true },
  linkedOperationId: { type: DataTypes.INTEGER, field: 'linked_operation_id', allowNull: true },
}, { tableName: 'operations', timestamps: false });

const Echeance = sequelize.define('Echeance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  accountId: { type: DataTypes.INTEGER, field: 'account_id', allowNull: false },
  dayOfMonth: { type: DataTypes.INTEGER, field: 'day_of_month', allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  type: {
    type: DataTypes.ENUM('CB', 'Virement', 'Remise de chèque', 'Prélèvement', 'Chèque'),
    allowNull: false,
  },
  tierId: { type: DataTypes.INTEGER, field: 'tier_id', allowNull: true },
  categoryId: { type: DataTypes.INTEGER, field: 'category_id', allowNull: true },
  note: { type: DataTypes.TEXT, defaultValue: '' },
  equilibre: { type: DataTypes.BOOLEAN, defaultValue: true },
  lastAppliedMonth: { type: DataTypes.STRING(7), field: 'last_applied_month', allowNull: true },
}, { tableName: 'echeances', timestamps: false });

const EcartOverride = sequelize.define('EcartOverride', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  account1Id: { type: DataTypes.INTEGER, field: 'account1_id', allowNull: false },
  account2Id: { type: DataTypes.INTEGER, field: 'account2_id', allowNull: false },
  month: { type: DataTypes.STRING(7), allowNull: false },
  ecartAccount1: { type: DataTypes.DECIMAL(12, 2), field: 'ecart_account1' },
  ecartAccount2: { type: DataTypes.DECIMAL(12, 2), field: 'ecart_account2' },
}, { tableName: 'ecart_overrides', timestamps: false });

const ImportMapping = sequelize.define('ImportMapping', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, field: 'user_id', allowNull: false },
  format: DataTypes.STRING(10),
  mappingJson: { type: DataTypes.JSON, field: 'mapping_json' },
}, { tableName: 'import_mappings', timestamps: false });

const EquilibragePreference = sequelize.define('EquilibragePreference', {
  userId: { type: DataTypes.INTEGER, field: 'user_id', primaryKey: true },
  account1Id: { type: DataTypes.INTEGER, field: 'account1_id' },
  account2Id: { type: DataTypes.INTEGER, field: 'account2_id' },
}, { tableName: 'equilibrage_preferences', timestamps: false });

// Associations
User.hasMany(Account, { foreignKey: 'user_id' });
Account.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Category, { foreignKey: 'user_id' });
Category.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Tier, { foreignKey: 'user_id' });
Tier.belongsTo(User, { foreignKey: 'user_id' });

Account.hasMany(Operation, { foreignKey: 'account_id', onDelete: 'CASCADE' });
Operation.belongsTo(Account, { foreignKey: 'account_id' });

Account.hasMany(Echeance, { foreignKey: 'account_id', onDelete: 'CASCADE' });
Echeance.belongsTo(Account, { foreignKey: 'account_id' });

module.exports = {
  sequelize,
  User, Account, Category, Tier, Operation,
  Echeance, EcartOverride, ImportMapping, EquilibragePreference,
};

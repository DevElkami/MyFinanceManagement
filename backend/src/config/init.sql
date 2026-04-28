-- Finance 2026 — Database initialization
-- Run this script once to create the schema before starting the backend

CREATE DATABASE IF NOT EXISTS finance2026 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finance2026;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  login VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  bank VARCHAR(100),
  owner VARCHAR(100),
  solde_initial DECIMAL(12,2) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR(100) NOT NULL,
  type ENUM('Salaire','Alimentation','Essence','Péage','Maison','Energie','Voiture','Divers') DEFAULT 'Divers',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tiers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR(100) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS operations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type ENUM('CB','Virement','Remise de chèque','Prélèvement','Chèque') NOT NULL,
  tier_id INT,
  category_id INT,
  note TEXT DEFAULT '',
  statut ENUM('Aucun','Pointé','Rapproché') DEFAULT 'Aucun',
  equilibre BOOLEAN DEFAULT TRUE,
  linked_operation_id INT,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (tier_id) REFERENCES tiers(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS echeances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  day_of_month INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type ENUM('CB','Virement','Remise de chèque','Prélèvement','Chèque') NOT NULL,
  tier_id INT,
  category_id INT,
  note TEXT DEFAULT '',
  equilibre BOOLEAN DEFAULT TRUE,
  last_applied_month VARCHAR(7),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ecart_overrides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account1_id INT NOT NULL,
  account2_id INT NOT NULL,
  month VARCHAR(7) NOT NULL,
  ecart_account1 DECIMAL(12,2),
  ecart_account2 DECIMAL(12,2)
);

CREATE TABLE IF NOT EXISTS import_mappings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  format VARCHAR(10),
  mapping_json JSON,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS equilibrage_preferences (
  user_id INT PRIMARY KEY,
  account1_id INT,
  account2_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

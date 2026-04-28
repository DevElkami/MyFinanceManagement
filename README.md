# Handoff: Finance 2026 — Application de gestion de finances personnelles

## Overview
Finance 2026 est une application complète de gestion de finances personnelles, sous forme de PWA (Progressive Web App). Elle permet de gérer des comptes bancaires, des opérations, des échéances récurrentes, et un système d'équilibrage entre deux comptes basé sur les salaires.

## About the Design Files
Les fichiers HTML/JSX dans ce dossier sont des **prototypes de design créés en HTML** — ils montrent l'apparence et le comportement souhaités mais ne sont PAS du code de production. La tâche est de **recréer ces designs** dans un vrai projet avec :
- **Backend** : Node.js + Express, API REST, JWT (durée 6 mois), base MySQL
- **Frontend** : React + TypeScript, PWA
- **Responsive** : Desktop et mobile
- **Thèmes** : Clair et sombre

## Fidelity
**High-fidelity (hifi)** — Les maquettes sont pixel-perfect avec les couleurs, typographies, espacements et interactions finaux du design system SRCI. Le développeur doit recréer l'UI fidèlement.

---

## Architecture technique attendue

### Backend (Node.js)
```
backend/
├── src/
│   ├── config/          # DB config, JWT config
│   ├── middleware/       # auth JWT middleware
│   ├── routes/           # API routes
│   ├── controllers/      # Business logic
│   ├── models/           # MySQL models (Sequelize ou Knex)
│   └── services/         # Import parser, calcul équilibrage
├── package.json
└── .env
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/       # Composants UI réutilisables
│   ├── pages/            # Écrans principaux
│   ├── hooks/            # Custom hooks
│   ├── services/         # API calls
│   ├── store/            # État global (Context ou Zustand)
│   ├── types/            # Types TypeScript
│   └── styles/           # Tokens CSS, thème
├── public/
│   └── manifest.json     # PWA manifest
└── package.json
```

---

## Modèle de données (MySQL)

### Table `users`
| Colonne | Type | Notes |
|---------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| login | VARCHAR(100) UNIQUE | |
| password_hash | VARCHAR(255) | bcrypt |
| created_at | DATETIME | |

### Table `accounts`
| Colonne | Type | Notes |
|---------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| user_id | INT FK → users.id | |
| name | VARCHAR(100) | |
| bank | VARCHAR(100) | |
| owner | VARCHAR(100) | |
| solde_initial | DECIMAL(12,2) | |

### Table `categories`
| Colonne | Type | Notes |
|---------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| user_id | INT FK → users.id | |
| label | VARCHAR(100) | |
| type | ENUM('Salaire','Alimentation','Essence','Péage','Maison','Energie','Voiture','Divers') | |

### Table `tiers`
| Colonne | Type | Notes |
|---------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| user_id | INT FK → users.id | |
| label | VARCHAR(100) | |

### Table `operations`
| Colonne | Type | Notes |
|---------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| account_id | INT FK → accounts.id | |
| date | DATE | |
| amount | DECIMAL(12,2) | Négatif = débit, positif = crédit |
| type | ENUM('CB','Virement','Remise de chèque','Prélèvement','Chèque') | |
| tier_id | INT FK → tiers.id | |
| category_id | INT FK → categories.id | |
| note | TEXT | |
| statut | ENUM('Aucun','Pointé','Rapproché') DEFAULT 'Aucun' | |
| equilibre | BOOLEAN DEFAULT TRUE | |
| linked_operation_id | INT FK → operations.id NULL | Pour virements inter-comptes |

### Table `echeances`
| Colonne | Type | Notes |
|---------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| account_id | INT FK → accounts.id | |
| day_of_month | INT | Jour du mois (1-31) |
| amount | DECIMAL(12,2) | |
| type | ENUM('CB','Virement','Remise de chèque','Prélèvement','Chèque') | |
| tier_id | INT FK → tiers.id | |
| category_id | INT FK → categories.id | |
| note | TEXT | |
| equilibre | BOOLEAN DEFAULT TRUE | |
| last_applied_month | VARCHAR(7) | Format 'YYYY-MM', dernier mois appliqué |

### Table `ecart_overrides`
| Colonne | Type | Notes |
|---------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| account1_id | INT FK | |
| account2_id | INT FK | |
| month | VARCHAR(7) | 'YYYY-MM' |
| ecart_account1 | DECIMAL(12,2) | Valeur forcée par l'utilisateur |
| ecart_account2 | DECIMAL(12,2) | |

### Table `import_mappings`
| Colonne | Type | Notes |
|---------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| user_id | INT FK | |
| format | VARCHAR(10) | csv, xml, ofx, cfonb |
| mapping_json | JSON | Correspondance colonnes → champs |

### Table `equilibrage_preferences`
| Colonne | Type | Notes |
|---------|------|-------|
| user_id | INT FK PK | |
| account1_id | INT FK | |
| account2_id | INT FK | |

---

## API REST Endpoints

### Auth
- `POST /api/auth/register` — Création compte (première utilisation)
- `POST /api/auth/login` — Connexion → retourne JWT (6 mois)

### Accounts
- `GET /api/accounts` — Liste des comptes
- `POST /api/accounts` — Créer un compte
- `PUT /api/accounts/:id` — Modifier un compte
- `DELETE /api/accounts/:id` — Supprimer compte + opérations + échéances

### Operations
- `GET /api/accounts/:id/operations` — Liste des opérations (avec filtres query params: type, category_id, statut, tier_id, note)
- `POST /api/accounts/:id/operations` — Créer une opération
- `PUT /api/operations/:id` — Modifier (si linked_operation_id, modifier aussi l'opération liée)
- `DELETE /api/operations/:id` — Supprimer (si linked, supprimer aussi)
- `PATCH /api/operations/:id/statut` — Changer statut (Aucun → Pointé → Rapproché)
- `POST /api/accounts/:id/rapprocher` — Marquer toutes les pointées comme rapprochées

### Import
- `POST /api/accounts/:id/import` — Import fichier (multipart, détection doublons)
- `GET /api/import-mappings` — Récupérer le dernier mapping
- `POST /api/import-mappings` — Sauvegarder un mapping

### Categories
- `GET /api/categories` — Liste
- `POST /api/categories` — Créer
- `PUT /api/categories/:id` — Modifier
- `DELETE /api/categories/:id` — Supprimer

### Tiers
- `GET /api/tiers` — Liste
- `POST /api/tiers` — Créer
- `PUT /api/tiers/:id` — Modifier
- `DELETE /api/tiers/:id` — Supprimer

### Échéances
- `GET /api/accounts/:id/echeances` — Liste
- `POST /api/accounts/:id/echeances` — Créer
- `PUT /api/echeances/:id` — Modifier
- `DELETE /api/echeances/:id` — Supprimer
- `POST /api/accounts/:id/apply-echeances` — Appliquer les échéances manquantes (appelé à l'ouverture)

### Équilibrage
- `GET /api/equilibrage?account1=X&account2=Y` — Calculs par mois
- `PUT /api/equilibrage/ecart` — Forcer un écart
- `DELETE /api/equilibrage/ecart/:id` — Supprimer un forçage
- `GET /api/equilibrage/preferences` — Récupérer les comptes mémorisés
- `PUT /api/equilibrage/preferences` — Sauvegarder

### Statistiques
- `GET /api/statistics?mode=compare|year|five_years|all_time&accounts=1,2&category=X` — Données pour graphiques

---

## Screens / Views

### 1. Écran de connexion (`LoginScreen`)
- **Purpose** : Authentification ou création de compte (première utilisation)
- **Layout** : Centré verticalement, carte blanche 400px de large sur fond gris clair
- **Composants** :
  - Icône portefeuille dans carré teal arrondi (56×56px, radius 12px, bg `#008577`)
  - Titre "Finance 2026" — Montserrat 1.5rem/500
  - Sous-titre — 0.875rem, couleur `#7a7a84`
  - Onglets Connexion / Première utilisation — bordure active teal `#008577`
  - Champs : Identifiant, Mot de passe, (+ Confirmer si première utilisation)
  - Bouton pleine largeur "Se connecter" / "Créer mon compte" — bg `#008577`
  - Messages d'erreur : fond `#fef2f2`, texte `#E91B0C`

### 2. Écran d'accueil (`HomeScreen`)
- **Purpose** : Vue d'ensemble des comptes
- **Layout** : Grille responsive `repeat(auto-fill, minmax(340px, 1fr))`, gap 16px, padding 24px
- **Barre supérieure** : titre "Mes comptes" + boutons "Équilibrage" (outline) et "Nouveau compte" (primary)
- **Carte de compte** :
  - Fond blanc, radius 8px, border `#e8e8eb`, padding 20px
  - Header : nom du compte (1rem/500) + banque/propriétaire (0.75rem, `#7a7a84`) + boutons éditer/supprimer
  - Solde : 1.5rem/500, vert `#048604` si positif, rouge `#E91B0C` si négatif
  - Stats 4 mois : grille 4 colonnes, recettes (vert) et dépenses (rouge), font 0.7rem

### 3. Écran de consultation (`ConsultationScreen`)
- **Purpose** : Voir et gérer les opérations d'un compte
- **Layout** : Flex column, hauteur 100%
- **Barre d'outils** : bouton retour (teal), nom du compte, badge solde, boutons (Importer, Catégories, Tiers, Échéancier, + Opération)
- **Barre rapprochement** : fond `#f9f9f9`, input montant, écart affiché, bouton "Rapprocher"
- **Filtres** (toggle) : Type, Catégorie, Statut, Tiers, Note (recherche temps réel), bouton Réinitialiser
- **Table des opérations** :
  - Colonnes : Date, Type, Tiers, Débit (rouge), Crédit (vert), Statut (bouton rond coloré), Solde cumulé, Actions
  - Statut : ○ = Aucun (`#babac4`), ● = Pointé (`#0B78D0`), ✓ = Rapproché (`#048604`)
  - Lignes alternées `#fff` / `#fafafa`
  - Font 0.8rem
- **Pied de page** : stats 4 mois + solde pointé (`#0B78D0`) + solde courant

### 4. Popup opération (`OperationPopup`)
- **Purpose** : Ajouter ou modifier une opération
- **Layout** : Modal 480px, formulaire vertical gap 14px
- **Composants** :
  - Toggle Débit/Crédit (2 boutons, rouge/vert avec fond coloré léger quand actif)
  - Date (input date), Montant (number step 0.01)
  - Type d'opération (select), Tiers (select), Catégorie (select)
  - Note (texte), Virement inter-comptes (select, optionnel)
  - Checkbox "Inclure dans l'équilibrage" (cochée par défaut)
  - Boutons Fermer (secondary) + Valider (primary)

### 5. Import wizard (`ImportWizard`)
- **Purpose** : Importer des opérations depuis un fichier
- **Layout** : Modal 640px, stepper 4 étapes
- **Étapes** :
  1. **Fichier** : Select format (CSV/XML/OFX/CFONB), zone drop, mapping colonnes (grille 2 cols)
  2. **Aperçu** : Table prévisualisation des opérations
  3. **Vérification** : Avertissement (fond `#FFF7ED`, border `#C24E00`) si le compte a déjà des opérations
  4. **Import** : Spinner puis confirmation verte
- **Stepper** : 4 cercles numérotés, actif = teal, complété = vert avec ✓

### 6. Gestion catégories / tiers / échéancier (`ManagementScreen`)
- **Purpose** : CRUD pour catégories, tiers, échéances
- **Layout** : Toolbar + table pleine largeur
- **Toolbar** : bouton retour, titre, boutons Ajouter/Modifier/Supprimer (modifier et supprimer désactivés si aucune sélection)
- **Table** : clic pour sélectionner (fond `#edf7f6`), colonnes selon le type
- **Modales de formulaire** : champs spécifiques à chaque entité

### 7. Écran d'équilibrage (`EquilibrageScreen`)
- **Purpose** : Comparer les dépenses de 2 comptes au prorata des salaires
- **Layout** : Toolbar + sélecteurs comptes + onglets mois + contenu
- **Sélecteurs** : 2 Select avec symbole ⇄ entre eux
- **Onglets mois** : boutons scrollables horizontalement, actif = underline teal
- **Table par catégorie** : colonnes Catégorie, Compte 1, Compte 2 — clic pour déplier les opérations détaillées
- **Totaux** : Total débits, Salaires, Total prorata, Écart (fond `#f0f9f7`)
- **Calcul prorata** :
  - ratio1 = (sal1 + sal2) / sal1
  - ratio2 = (sal1 + sal2) / sal2
  - prorata1 = totalDebits2comptes / ratio2
  - prorata2 = totalDebits2comptes / ratio1
  - écart = débits - prorata + report mois précédent

### 8. Statistiques (`StatisticsScreen`)
- **Purpose** : Visualiser les tendances par catégorie
- **Modes** : Comparaison mois précédent, Cumuls année, Cumuls 5 ans, Cumuls depuis le début
- **Filtres** : Mode (select), Comptes (tous/individuel), Catégorie (toutes/individuelle)
- **Graphique** : SVG line chart avec légende couleurs

---

## Interactions & Behavior

### Navigation
- Login → Home → clic compte → Consultation → sous-écrans (Catégories, Tiers, Échéancier, Import)
- Home → Équilibrage → Statistiques
- Sidebar persistante avec lien vers écran actif

### États interactifs
- **Boutons** : hover = assombrissement (primary `#006b62`, secondary `#d5d5d8`)
- **Lignes table** : hover = `filter: brightness(0.97)`
- **Inputs** : focus = border `#008577`
- **Transitions** : 150ms ease-in-out partout

### Comportements spécifiques
- **F5 sur consultation** : change le statut de l'opération sélectionnée (cycle Aucun → Pointé → Rapproché)
- **Rapprochement** : confirmation avant, irréversible mais modification autorisée avec avertissement
- **Échéances** : à l'ouverture d'un compte, appliquer automatiquement les échéances pour chaque mois manqué depuis `last_applied_month`
- **Virement inter-comptes** : créer 2 opérations liées (débit sur un, crédit sur l'autre), modifier/supprimer l'une met à jour l'autre
- **Import doublons** : ignorer si même date + montant + tiers + type débit/crédit

---

## Design Tokens

### Couleurs
| Token | Valeur | Usage |
|-------|--------|-------|
| Primary | `#008577` | Boutons, liens, accents |
| Primary dark | `#006b62` | Hover |
| Primary light | `#4da69f` | Backgrounds secondaires |
| Success | `#048604` | Crédits, confirmations |
| Error | `#E91B0C` | Débits, alertes |
| Info | `#0B78D0` | Solde pointé, info |
| Warning | `#C24E00` | Avertissements |
| Text primary | `#27272f` | Texte principal |
| Text secondary | `#5a5a64` | Labels |
| Text tertiary | `#7a7a84` | Placeholders |
| Gray 300 | `#d5d5d8` | Borders inputs |
| Gray 200 | `#e8e8eb` | Borders, séparateurs |
| Gray 100 | `#f3f3f5` | Backgrounds thead |
| Bg primary | `#f5f5f5` | Fond page |
| Surface | `#ffffff` | Cartes, modales |
| Surface alt | `#f9f9f9` | Fond filtres |

### Typographie
- **Font** : Montserrat 400/500/600
- **H2** : 1.25rem / 500
- **Body** : 0.8-0.875rem / 400
- **Small** : 0.7-0.75rem / 400-500
- **Button** : 0.875rem / 500

### Spacing
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px

### Radius
- Inputs/boutons : 5px
- Cartes/modales : 8px
- Badges : 9999px

### Shadows
- Cards : `0 1px 2px rgba(0,0,0,0.05)`
- Modales : `0 10px 15px rgba(0,0,0,0.1)`

---

## Assets
- `colors_and_type.css` — Tokens CSS complets du design system SRCI
- `assets/logo_srci_blanc.svg` — Logo blanc
- `assets/logo_srci_gris.svg` — Logo gris

## Design Files (référence)
- `index.html` — Point d'entrée
- `app.jsx` — App principale, routing, état, tweaks
- `shared.jsx` — Composants UI partagés (Btn, Input, Select, Badge, Modal, Icons)
- `data.jsx` — Données de démo
- `login.jsx` — Écran connexion
- `home.jsx` — Écran accueil
- `consultation.jsx` — Écran consultation
- `operation-popup.jsx` — Popup ajout/modification opération
- `import-wizard.jsx` — Wizard d'import
- `management.jsx` — Écrans catégories, tiers, échéancier
- `equilibrage.jsx` — Écrans équilibrage et statistiques

# Finance 2026 — Personal Finance Management Application

## Overview
Finance 2026 is a comprehensive personal finance management application, delivered as a PWA (Progressive Web App). It allows managing bank accounts, transactions, recurring scheduled items, and a balancing system between two accounts based on salaries.

## About the Design Files
The HTML/JSX files in this folder are **design prototypes created in HTML** — they show the desired appearance and behavior but are NOT production code. The task is to **recreate these designs** in a real project with:
- **Backend**: Node.js + Express, REST API, JWT (6-month duration), MySQL database
- **Frontend**: React + TypeScript, PWA
- **Responsive**: Desktop and mobile
- **Themes**: Light and dark

---

## Expected Technical Architecture

### Backend (Node.js)
```
backend/
├── src/
│   ├── config/          # DB config, JWT config
│   ├── middleware/       # auth JWT middleware
│   ├── routes/           # API routes
│   ├── controllers/      # Business logic
│   ├── models/           # MySQL models (Sequelize or Knex)
│   └── services/         # Import parser, balancing calculation
├── package.json
└── .env
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Main screens
│   ├── hooks/            # Custom hooks
│   ├── services/         # API calls
│   ├── store/            # Global state (Context or Zustand)
│   ├── types/            # TypeScript types
│   └── styles/           # CSS tokens, theme
├── public/
│   └── manifest.json     # PWA manifest
└── package.json
```

---

## Data Model (MySQL)

### Table `users`
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| login | VARCHAR(100) UNIQUE | |
| password_hash | VARCHAR(255) | bcrypt |
| created_at | DATETIME | |

### Table `accounts`
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| user_id | INT FK → users.id | |
| name | VARCHAR(100) | |
| bank | VARCHAR(100) | |
| owner | VARCHAR(100) | |
| solde_initial | DECIMAL(12,2) | |

### Table `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| user_id | INT FK → users.id | |
| label | VARCHAR(100) | |
| type | ENUM('Salaire','Alimentation','Essence','Péage','Maison','Energie','Voiture','Divers') | |

### Table `tiers`
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| user_id | INT FK → users.id | |
| label | VARCHAR(100) | |

### Table `operations`
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| account_id | INT FK → accounts.id | |
| date | DATE | |
| amount | DECIMAL(12,2) | Negative = debit, positive = credit |
| type | ENUM('CB','Virement','Remise de chèque','Prélèvement','Chèque') | |
| tier_id | INT FK → tiers.id | |
| category_id | INT FK → categories.id | |
| note | TEXT | |
| statut | ENUM('Aucun','Pointé','Rapproché') DEFAULT 'Aucun' | |
| equilibre | BOOLEAN DEFAULT TRUE | |
| linked_operation_id | INT FK → operations.id NULL | For inter-account transfers |

### Table `echeances`
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| account_id | INT FK → accounts.id | |
| day_of_month | INT | Day of month (1-31) |
| amount | DECIMAL(12,2) | |
| type | ENUM('CB','Virement','Remise de chèque','Prélèvement','Chèque') | |
| tier_id | INT FK → tiers.id | |
| category_id | INT FK → categories.id | |
| note | TEXT | |
| equilibre | BOOLEAN DEFAULT TRUE | |
| last_applied_month | VARCHAR(7) | Format 'YYYY-MM', last month applied |

### Table `ecart_overrides`
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| account1_id | INT FK | |
| account2_id | INT FK | |
| month | VARCHAR(7) | 'YYYY-MM' |
| ecart_account1 | DECIMAL(12,2) | Value forced by the user |
| ecart_account2 | DECIMAL(12,2) | |

### Table `import_mappings`
| Column | Type | Notes |
|--------|------|-------|
| id | INT AUTO_INCREMENT PK | |
| user_id | INT FK | |
| format | VARCHAR(10) | csv, xml, ofx, cfonb |
| mapping_json | JSON | Column → field mapping |

### Table `equilibrage_preferences`
| Column | Type | Notes |
|--------|------|-------|
| user_id | INT FK PK | |
| account1_id | INT FK | |
| account2_id | INT FK | |

---

## REST API Endpoints

### Auth
- `POST /api/auth/register` — Account creation (first use)
- `POST /api/auth/login` — Login → returns JWT (6 months)

### Accounts
- `GET /api/accounts` — List accounts
- `POST /api/accounts` — Create an account
- `PUT /api/accounts/:id` — Edit an account
- `DELETE /api/accounts/:id` — Delete account + operations + scheduled items

### Operations
- `GET /api/accounts/:id/operations` — List operations (with query param filters: type, category_id, statut, tier_id, note)
- `POST /api/accounts/:id/operations` — Create an operation
- `PUT /api/operations/:id` — Edit (if linked_operation_id, also edit the linked operation)
- `DELETE /api/operations/:id` — Delete (if linked, also delete the linked one)
- `PATCH /api/operations/:id/statut` — Change status (Aucun → Pointé → Rapproché)
- `POST /api/accounts/:id/rapprocher` — Mark all pointed items as reconciled

### Import
- `POST /api/accounts/:id/import` — Import file (multipart, duplicate detection)
- `GET /api/import-mappings` — Retrieve last mapping
- `POST /api/import-mappings` — Save a mapping

### Categories
- `GET /api/categories` — List
- `POST /api/categories` — Create
- `PUT /api/categories/:id` — Edit
- `DELETE /api/categories/:id` — Delete

### Tiers
- `GET /api/tiers` — List
- `POST /api/tiers` — Create
- `PUT /api/tiers/:id` — Edit
- `DELETE /api/tiers/:id` — Delete

### Scheduled Items (Échéances)
- `GET /api/accounts/:id/echeances` — List
- `POST /api/accounts/:id/echeances` — Create
- `PUT /api/echeances/:id` — Edit
- `DELETE /api/echeances/:id` — Delete
- `POST /api/accounts/:id/apply-echeances` — Apply missing scheduled items (called on open)

### Balancing (Équilibrage)
- `GET /api/equilibrage?account1=X&account2=Y` — Calculations by month
- `PUT /api/equilibrage/ecart` — Force a gap value
- `DELETE /api/equilibrage/ecart/:id` — Delete a forced value
- `GET /api/equilibrage/preferences` — Retrieve saved accounts
- `PUT /api/equilibrage/preferences` — Save preferences

### Statistics
- `GET /api/statistics?mode=compare|year|five_years|all_time&accounts=1,2&category=X` — Data for charts

---

## Screens / Views

### 1. Login Screen
- **Purpose**: Authentication or account creation (first use)
- **Layout**: Vertically centered, 400px wide white card on light gray background
- **Components**:
  - Wallet icon in rounded teal square (56×56px, radius 12px, bg `#008577`)
  - Title "Finance 2026" — Montserrat 1.5rem/500
  - Subtitle — 0.875rem, color `#7a7a84`
  - Tabs: Login / First use — active border teal `#008577`
  - Fields: Username, Password, (+ Confirm if first use)
  - Full-width button "Se connecter" / "Créer mon compte" — bg `#008577`
  - Error messages: bg `#fef2f2`, text `#E91B0C`

### 2. Home Screen
- **Purpose**: Overview of accounts
- **Layout**: Responsive grid `repeat(auto-fill, minmax(340px, 1fr))`, gap 16px, padding 24px
- **Top bar**: title "Mes comptes" + "Équilibrage" button (outline) and "Nouveau compte" button (primary)
- **Account card**:
  - White background, radius 8px, border `#e8e8eb`, padding 20px
  - Header: account name (1rem/500) + bank/owner (0.75rem, `#7a7a84`) + edit/delete buttons
  - Balance: 1.5rem/500, green `#048604` if positive, red `#E91B0C` if negative
  - 4-month stats: 4-column grid, income (green) and expenses (red), font 0.7rem

### 3. Consultation Screen
- **Purpose**: View and manage operations for an account
- **Layout**: Flex column, full height
- **Toolbar**: back button (teal), account name, balance badge, buttons (Import, Categories, Tiers, Scheduler, + Operation)
- **Reconciliation bar**: bg `#f9f9f9`, amount input, displayed gap, "Rapprocher" button
- **Filters** (toggle): Type, Category, Status, Tiers, Note (real-time search), Reset button
- **Operations table**:
  - Columns: Date, Type, Tiers, Debit (red), Credit (green), Status (colored round button), Cumulative balance, Actions
  - Status: ○ = None (`#babac4`), ● = Pointed (`#0B78D0`), ✓ = Reconciled (`#048604`)
  - Alternating rows `#fff` / `#fafafa`
  - Font 0.8rem
- **Footer**: 4-month stats + pointed balance (`#0B78D0`) + current balance

### 4. Operation Popup
- **Purpose**: Add or edit an operation
- **Layout**: 480px modal, vertical form gap 14px
- **Components**:
  - Debit/Credit toggle (2 buttons, red/green with light colored background when active)
  - Date (date input), Amount (number step 0.01)
  - Operation type (select), Tiers (select), Category (select)
  - Note (text), Inter-account transfer (select, optional)
  - Checkbox "Include in balancing" (checked by default)
  - Close (secondary) + Submit (primary) buttons

### 5. Import Wizard
- **Purpose**: Import operations from a file
- **Layout**: 640px modal, 4-step stepper
- **Steps**:
  1. **File**: Select format (CSV/XML/OFX/CFONB), drop zone, column mapping (2-col grid)
  2. **Preview**: Table preview of operations
  3. **Verification**: Warning (bg `#FFF7ED`, border `#C24E00`) if the account already has operations
  4. **Import**: Spinner then green confirmation
- **Stepper**: 4 numbered circles, active = teal, completed = green with ✓

### 6. Categories / Tiers / Scheduler Management
- **Purpose**: CRUD for categories, tiers, scheduled items
- **Layout**: Toolbar + full-width table
- **Toolbar**: back button, title, Add/Edit/Delete buttons (Edit and Delete disabled if nothing selected)
- **Table**: click to select (bg `#edf7f6`), columns according to entity type
- **Form modals**: fields specific to each entity

### 7. Balancing Screen
- **Purpose**: Compare expenses of 2 accounts proportional to salaries
- **Layout**: Toolbar + account selectors + month tabs + content
- **Selectors**: 2 Selects with ⇄ symbol between them
- **Month tabs**: horizontally scrollable buttons, active = teal underline
- **Category table**: columns Category, Account 1, Account 2 — click to expand detailed operations
- **Totals**: Total debits, Salaries, Total prorata, Gap (bg `#f0f9f7`)
- **Prorata calculation**:
  - ratio1 = (sal1 + sal2) / sal1
  - ratio2 = (sal1 + sal2) / sal2
  - prorata1 = totalDebits2comptes / ratio2
  - prorata2 = totalDebits2comptes / ratio1
  - gap = debits - prorata + previous month carry-over

### 8. Statistics
- **Purpose**: Visualize trends by category
- **Modes**: Previous month comparison, Year cumulative, 5-year cumulative, All-time cumulative
- **Filters**: Mode (select), Accounts (all/individual), Category (all/individual)
- **Chart**: SVG line chart with color legend

---

## Interactions & Behavior

### Navigation
- Login → Home → click account → Consultation → sub-screens (Categories, Tiers, Scheduler, Import)
- Home → Balancing → Statistics
- Persistent sidebar with link to current screen

### Interactive States
- **Buttons**: hover = darken (primary `#006b62`, secondary `#d5d5d8`)
- **Table rows**: hover = `filter: brightness(0.97)`
- **Inputs**: focus = border `#008577`
- **Transitions**: 150ms ease-in-out everywhere

### Specific Behaviors
- **F5 on consultation**: cycles the status of the selected operation (None → Pointed → Reconciled)
- **Reconciliation**: confirmation required, irreversible but editing allowed with a warning
- **Scheduled items**: on opening an account, automatically apply scheduled items for each missing month since `last_applied_month`
- **Inter-account transfers**: create 2 linked operations (debit on one, credit on the other), editing/deleting one updates the other
- **Import duplicates**: ignore if same date + amount + tiers + debit/credit type

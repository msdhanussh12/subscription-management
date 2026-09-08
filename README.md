# SubFlow — Subscription Management Web Application

A full-stack, production-quality **Subscription Management System for Small Businesses** built with React (Vite), Node.js (Express), MySQL, and JWT Authentication.

---

## 1. Project Overview

SubFlow allows small and medium business owners to manage their customers, subscription plans, and recurring customer subscriptions with live metrics, search, status lifecycles, and Monthly Recurring Revenue (MRR) tracking calculated dynamically from database records.

---

## 2. Key Features

- **Authentication & Security**:
  - Secure signup with field validation (password length, confirmation match, unique email check).
  - JWT-based authentication with Bearer token header injection and auto-logout upon expiration.
  - Password hashing with `bcryptjs` (salt rounds = 10).
  - Protected API routes and protected React Router routes.
- **Interactive Dashboard**:
  - 5 dynamic statistic KPI cards: Total Customers, Total Subscriptions, Active Subscriptions, Cancelled Subscriptions, and Monthly Recurring Revenue (MRR).
  - Dynamic **Recharts** interactive donut chart for status breakdown (Active, Cancelled, Expired) and comparative bar chart.
  - Recent Subscriptions table with quick links to subscription details.
  - Live refresh button pulling directly from MySQL aggregation queries.
- **Customer Management (Full CRUD)**:
  - List customers with company info, phone, and subscription counts.
  - Real-time search by customer name, email, or company.
  - View full customer profile and all their associated subscriptions (active and historical).
  - Add & edit customer modal with client and server validation.
  - Safe deletion safeguards (prevents deleting customers with active subscriptions).
- **Subscription Plans (Full CRUD)**:
  - Plan pricing tiers with Monthly or Yearly billing cycles.
  - Displays count of active subscriptions using each plan.
  - Add & edit plan modal with numeric price validation.
  - Referential integrity: prevents deleting plans that are currently in use by subscriptions.
- **Subscriptions Management (Full CRUD + State Transitions)**:
  - Create subscription with Customer and Plan selector dropdowns.
  - Auto-populates price, billing cycle, and calculated end date upon plan selection.
  - Quick status changer modal (`Active`, `Cancelled`, `Expired`).
  - Search by customer name or plan name.
  - Multi-criteria filtering by Status and Billing Cycle processed via SQL `WHERE` clauses.
  - Complete subscription detail view with nested customer and plan breakdown.
- **UI / UX Polish**:
  - **Light & Dark Theme Toggle**: Seamless navbar toggle between high-contrast dark mode and sleek light mode, with automatic state persistence in `localStorage`.
  - Modern, responsive dashboard design system with glassmorphic cards, smooth badge colors, and micro-animations.
  - Actionable error banners with retry capability.
  - Reusable empty states and accessible confirmation dialogs.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios (with Bearer token request and 401 response interceptors)
- **Charts**: Recharts (Pie/Donut & Bar charts)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS Design System with CSS variables and responsive layouts

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Password Security**: `bcryptjs`
- **Database Driver**: `mysql2/promise` (connection pooling and parameterized queries)
- **Configuration**: `dotenv`, `cors`

### Database
- **Engine**: MySQL / MariaDB (InnoDB engine with UTF-8 MB4)
- **Design**: Normalized relational schema with Primary Keys, Foreign Keys, Unique constraints, and Search Indexes.

---

## 4. Project Structure

```
Subscription management/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL pool connection using mysql2/promise
│   ├── controllers/
│   │   ├── authController.js     # Signup, login, me, logout
│   │   ├── customerController.js # CRUD & customer subscriptions lookup
│   │   ├── planController.js     # CRUD for subscription plans
│   │   ├── subscriptionController.js # CRUD, status update, search & filters
│   │   └── dashboardController.js    # Aggregations, MRR calculation, status breakdown
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & req.user injection
│   │   ├── errorMiddleware.js    # Global error handler & 404 handler
│   │   └── validationMiddleware.js # Schema validation rules for requests
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── planRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   └── dashboardRoutes.js
│   ├── scripts/
│   │   ├── schema.sql            # Table definitions, constraints, indexes
│   │   ├── seed.sql              # Realistic seed data (users, customers, plans, subscriptions)
│   │   └── initDb.js             # Automated database creation, table creation & seeding CLI
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Top header with user profile, quick status, logout
│   │   │   ├── Sidebar.jsx       # Navigation (Dashboard, Customers, Plans, Subscriptions)
│   │   │   ├── ProtectedRoute.jsx# Auth guard redirecting to /login
│   │   │   ├── Loading.jsx       # Polished spinner & skeleton loaders
│   │   │   ├── ErrorMessage.jsx  # Dismissible error banners with retry action
│   │   │   ├── EmptyState.jsx    # Visual empty states for search/table results
│   │   │   ├── Modal.jsx         # Accessible backdrop modal dialog
│   │   │   └── ConfirmDialog.jsx # Action confirmation modal (delete, status changes)
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # User auth state, login, signup, logout methods
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login screen with validation & demo credentials button
│   │   │   ├── Signup.jsx        # Signup screen with matching password check
│   │   │   ├── Dashboard.jsx     # KPI metric cards, MRR, Recharts status chart, recent subs
│   │   │   ├── Customers.jsx     # Customers table, search, pagination, action menu
│   │   │   ├── CustomerDetails.jsx # Detailed customer info & linked subscriptions
│   │   │   ├── CustomerForm.jsx  # Modal / form for create/edit customer
│   │   │   ├── Plans.jsx         # Plan cards/table, pricing display, billing cycle tags
│   │   │   ├── PlanForm.jsx      # Modal / form for create/edit plan
│   │   │   ├── Subscriptions.jsx # Subscriptions list with status/billing filters, search
│   │   │   ├── SubscriptionDetails.jsx # Complete sub details with customer & plan details
│   │   │   └── SubscriptionForm.jsx # Create/edit sub with auto-populating plan price/cycle
│   │   ├── services/
│   │   │   ├── api.js            # Axios instance with interceptors for JWT Bearer token
│   │   │   ├── authService.js
│   │   │   ├── customerService.js
│   │   │   ├── planService.js
│   │   │   ├── subscriptionService.js
│   │   │   └── dashboardService.js
│   │   ├── styles/
│   │   │   └── index.css         # Modern CSS design system
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 5. Database Schema & Relationships

### Entity Relationship Model

```
       ┌────────────────────────┐
       │         users          │
       ├────────────────────────┤
       │ id (PK)                │
       │ name                   │
       │ email (UNIQUE)         │
       │ password_hash          │
       │ created_at, updated_at │
       └────────────────────────┘

       ┌────────────────────────┐           ┌────────────────────────┐
       │       customers        │           │         plans          │
       ├────────────────────────┤           ├────────────────────────┤
       │ id (PK)                │           │ id (PK)                │
       │ name                   │           │ plan_name              │
       │ email                  │           │ price (CHECK >= 0)     │
       │ phone                  │           │ billing_cycle (ENUM)   │
       │ company                │           │ description            │
       │ address                │           │ created_at, updated_at │
       │ created_at, updated_at │           └───────────┬────────────┘
       └───────────┬────────────┘                       │
                   │ 1                                  │ 1
                   │                                    │
                   │ ∞                                  │ ∞
       ┌───────────┴────────────────────────────────────┴────────────┐
       │                        subscriptions                        │
       ├─────────────────────────────────────────────────────────────┤
       │ id (PK)                                                     │
       │ customer_id (FK -> customers.id, ON DELETE RESTRICT)        │
       │ plan_id (FK -> plans.id, ON DELETE RESTRICT)                │
       │ start_date (DATE)                                           │
       │ end_date (DATE)                                             │
       │ price (DECIMAL 10,2, CHECK >= 0)                            │
       │ billing_cycle (ENUM 'Monthly', 'Yearly')                    │
       │ status (ENUM 'Active', 'Cancelled', 'Expired')              │
       │ created_at, updated_at                                      │
       └─────────────────────────────────────────────────────────────┘
```

### Relational Safeguards
1. `customers.id` &rarr; `subscriptions.customer_id`:
   - Enforces foreign key constraint `ON DELETE RESTRICT`.
   - The application checks for active subscriptions before attempting customer deletion.
2. `plans.id` &rarr; `subscriptions.plan_id`:
   - Enforces foreign key constraint `ON DELETE RESTRICT`.
   - Prevents accidental deletion of plans currently attached to customer contracts.

---

## 6. How Dashboard MRR is Calculated

Monthly Recurring Revenue (MRR) represents the normalized monthly revenue generated by all **Active** customer subscriptions.

The calculation is executed entirely within MySQL using the following formula:

$$\text{MRR} = \sum_{\text{Active Monthly}} \text{price} + \sum_{\text{Active Yearly}} \frac{\text{price}}{12}$$

### SQL Implementation (`dashboardController.js`):
```sql
SELECT 
  COALESCE(
    SUM(
      CASE 
        WHEN billing_cycle = 'Monthly' THEN price 
        WHEN billing_cycle = 'Yearly' THEN price / 12.0 
        ELSE 0 
      END
    ), 
    0
  ) AS mrr
FROM subscriptions
WHERE status = 'Active';
```

- If a customer has a **Monthly** plan of ₹1,499.00, it contributes ₹1,499.00 to MRR.
- If a customer has a **Yearly** plan of ₹14,990.00, it contributes ₹14,990.00 / 12 = ₹1,249.17 to MRR.
- Subscriptions in **Cancelled** or **Expired** state contribute ₹0 to MRR.

---

## 7. Environment Variables Configuration

### Backend (`backend/.env`):
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=subscription_management
JWT_SECRET=super_secret_subscription_mgmt_jwt_key_2026_xYz
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 8. Installation & Setup Guide

### Prerequisites
- Node.js (v18+)
- MySQL or MariaDB running on port 3306 (e.g. XAMPP or MySQL Server)

### Quick Start (Single Terminal Command from Project Root)

From the project root folder `Subscription management`:
```bash
# 1. Initialize & Seed Database (Run once)
npm run db:init

# 2. Run Both Backend and Frontend Concurrently
npm run dev
```
*This command starts both the **Backend API** (port 5000) and **Frontend Client** (port 5173) simultaneously in a single terminal with colored output tags.*

---

### Step-by-Step / Separate Execution (Optional)

#### Initialize Database & Seed
```bash
npm run db:init
```

#### Run Backend Server (Port 5000)
```bash
npm run backend
```

#### Run Frontend Client (Port 5173)
```bash
npm run frontend
```

---

## 9. Sample Login Credentials

| Role | Email | Password |
|---|---|---|
| **Admin User** | `admin@example.com` | `Admin@123` |
| **Demo User** | `demo@example.com` | `Admin@123` |

---

## 10. REST API Documentation

### Authentication
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user | No |
| `POST` | `/api/auth/login` | Authenticate user & get JWT | No |
| `POST` | `/api/auth/logout` | Client sign out | No |
| `GET` | `/api/auth/me` | Fetch logged-in user profile | Yes |

### Dashboard
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/dashboard` | Get KPI cards, status breakdown, MRR, recent subs | Yes |

### Customers
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/customers` | List customers (supports `?search=xyz`) | Yes |
| `GET` | `/api/customers/:id` | Get customer details with all their subscriptions | Yes |
| `POST` | `/api/customers` | Create new customer | Yes |
| `PUT` | `/api/customers/:id` | Update customer info | Yes |
| `DELETE` | `/api/customers/:id` | Delete customer (blocks if active subs exist) | Yes |

### Plans
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/plans` | List plans with active subscription count | Yes |
| `GET` | `/api/plans/:id` | Get plan details | Yes |
| `POST` | `/api/plans` | Create new plan | Yes |
| `PUT` | `/api/plans/:id` | Update plan info | Yes |
| `DELETE` | `/api/plans/:id` | Delete plan (blocks if referenced) | Yes |

### Subscriptions
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/subscriptions` | List subscriptions (supports `?search=&status=&billingCycle=`) | Yes |
| `GET` | `/api/subscriptions/:id` | Get single subscription with customer & plan details | Yes |
| `POST` | `/api/subscriptions` | Create subscription | Yes |
| `PUT` | `/api/subscriptions/:id` | Update subscription details | Yes |
| `PATCH` | `/api/subscriptions/:id/status`| Update status (`Active`, `Cancelled`, `Expired`)| Yes |
| `DELETE` | `/api/subscriptions/:id` | Delete subscription | Yes |

---

## 11. Verification Checklist

- [x] User Signup with validation & duplicate email protection
- [x] User Login with JWT and password verification
- [x] Protected routes on both frontend (React Router) and backend (Express middleware)
- [x] Dashboard with dynamic database counts and live MRR calculation
- [x] Recharts status breakdown donut chart and status volume chart
- [x] Customer CRUD with search by name/email/company
- [x] Customer details with associated subscription history
- [x] Plan CRUD with active subscription counts
- [x] Subscription CRUD with auto-population of price and cycle upon plan selection
- [x] Subscriptions filtering by Status (`Active`, `Cancelled`, `Expired`) and Cycle (`Monthly`, `Yearly`)
- [x] Quick status changer modal
- [x] Loading, Error (with retry), and Empty states implemented on all pages
- [x] MySQL Foreign Key integrity (`ON DELETE RESTRICT`)

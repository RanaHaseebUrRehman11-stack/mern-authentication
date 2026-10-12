# Vehicle Service Management System (MERN)

A full-stack MERN application for managing vehicle service requests, with JWT
authentication, role-based authorization (user / admin / mechanic) and a
dedicated dashboard for each role.

- **Customer**: registers, manages their vehicles, creates service requests and
  tracks their status and completed service history.
- **Administrator**: views platform analytics, manages users and mechanics,
  assigns mechanics to requests and updates service status.
- **Mechanic**: signs in with a linked account, sees the jobs assigned to them
  and moves each job through its lifecycle (`Assigned` → `In Progress` →
  `Completed`).

---

## Technology stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19, React Router 7, Axios, Vite, plain CSS |
| Backend    | Node.js, Express 5, Mongoose 9 |
| Database   | MongoDB (Atlas or local) |
| Auth       | JWT (`Authorization: Bearer <token>`) |
| Security   | bcrypt password hashing, helmet, login rate limiting, role-based middleware |
| Tooling    | Jest + Supertest + mongodb-memory-server (API), Vitest + React Testing Library (UI), ESLint |

---

## Architecture and request flow

```
client (Vite/React)  --HTTPS/JSON-->  server (Express)  --Mongoose-->  MongoDB
      |                                     |
  AuthContext                        JWT middleware (auth / adminAuth)
  axios api client                   controllers -> models
```

1. The client signs in through `POST /api/auth/login` and stores the returned
   JWT.
2. Every request is sent with `Authorization: Bearer <token>` (injected by the
   axios interceptor in `client/src/services/api.js`).
3. `auth` middleware validates the token **and re-checks that the user still
   exists and is active**; `adminAuth` additionally requires `role === "admin"`;
   `mechanicAuth` resolves the linked `Mechanic` record from the database.
4. Controllers validate input, apply ownership checks, enforce the service
   lifecycle and query Mongoose models.

---

## Features implemented

### Authentication
- Registration with validation and bcrypt hashing.
- Login issuing a signed JWT (1 hour expiry), protected by login rate limiting.
- Profile retrieval with session restoration on refresh.
- Profile update (username and password change with current-password check).
- Inactive (soft-deleted) accounts are blocked from logging in **and from using
  an already-issued token**.
- Logout clears the client session.

### Users
- Register, list, and manage their own vehicles.
- Create service requests against their own vehicles.
- View their request list and completed service history.

### Administrators
- Dashboard analytics: total users, vehicles, mechanics, requests, and separate
  pending / assigned / in-progress / completed request counts.
- User listing and soft deletion (self and other administrators are protected).
- Full mechanic CRUD, plus optional creation of a **mechanic login account**
  (either when creating the mechanic or afterwards).
- Review self-registered mechanics and **approve** or **reject** them.
- View all service requests, assign mechanics, and update status.

### Mechanics
- Self-register for an account that must be approved before first sign-in.
- Dedicated dashboard with personal job statistics.
- Job list scoped strictly to the authenticated mechanic.
- Status updates restricted to the allowed transitions
  (`Assigned` → `In Progress` → `Completed`).
- Manage contact details and availability, and change password.

### Service lifecycle
`Pending` → `Assigned` → `In Progress` → `Completed`, with `Cancelled` possible
from any open state. `Completed` and `Cancelled` are terminal. Transition rules
are defined once in `server/utils/serviceWorkflow.js`.

### Out of scope (by design)
- Image uploads and advanced search/filtering.

---

## Folder structure

```
.
├── package.json            # Root scripts (concurrently dev orchestrator)
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Layout, Navbar, ProtectedRoute, reusable ui/
│   │   ├── contexts/        # AuthContext, ToastContext
│   │   ├── pages/           # user pages + pages/admin/* + pages/mechanic/*
│   │   ├── services/api.js  # axios client
│   │   └── styles/          # auth.css, app.css
│   └── .env.example
└── server/                 # Express API
    ├── config/db.js
    ├── controllers/
    ├── middleware/          # auth, adminAuth, mechanicAuth, error handling
    ├── models/              # User, Vehicle, Mechanic, ServiceRequest
    ├── routes/
    ├── utils/               # validation, workflow + error helpers
    ├── app.js               # express app (no listen, test-friendly)
    ├── server.js            # connects DB and starts listening
    ├── createAdmin.js       # safe admin bootstrap script
    ├── tests/               # Jest + Supertest test suite
    └── .env.example
```

---

## Prerequisites

- Node.js 18+ (developed on Node 24)
- npm
- A MongoDB instance (MongoDB Atlas connection string or a local `mongod`)

---

## Environment variables

Create `server/.env` (copy from `server/.env.example`) and `client/.env`
(copy from `client/.env.example`). **Never commit real secrets.**

### Backend (`server/.env`)

| Variable         | Required | Description |
|------------------|----------|-------------|
| `MONGO_URI`      | Yes      | MongoDB connection string |
| `JWT_SECRET`     | Yes      | Long random string used to sign tokens |
| `PORT`           | No       | API port (default `5000`) |
| `CLIENT_ORIGINS` | No       | Comma-separated allowed CORS origins (defaults to `http://localhost:5173`) |
| `ADMIN_USERNAME` | Bootstrap only | Initial admin username |
| `ADMIN_EMAIL`    | Bootstrap only | Initial admin email |
| `ADMIN_PASSWORD` | Bootstrap only | Initial admin password |
| `ADMIN_REGISTRATION_SECRET` | No | Enables `POST /auth/register/admin`; leave empty to keep admin self-registration **disabled** |
| `ADMIN_REGISTRATION_ENABLED` | No | Set to `false` to close admin self-registration even if a secret is set |

### Frontend (`client/.env`)

| Variable       | Required | Description |
|----------------|----------|-------------|
| `VITE_API_URL` | No       | Backend base URL (default `http://localhost:5000`) |

---

## Installation

```bash
# from the project root
npm run install:all
```

This installs the root orchestrator, the server and the client dependencies.

---

## Running the application

```bash
# start both backend and frontend together (from the project root)
npm run dev

# or individually
npm run start:server   # http://localhost:5000
npm run start:client   # http://localhost:5173
```

The API health route is `GET http://localhost:5000/`.

---

## Initial administrator setup

Administrator accounts are created explicitly, never on server startup.

```bash
# 1. Set ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD in server/.env
# 2. From the server directory:
npm --prefix server run create-admin
```

The script:
- Validates that the required environment variables are present.
- Never prints passwords or secrets.
- Does not create a duplicate if the email already exists.
- Does not reset existing passwords.

Standard registration always creates ordinary `user` accounts; the `role`
cannot be set through the public API.

### Secure administrator self-registration

In addition to the bootstrap script, administrators can self-register through
`POST /api/auth/register/admin` at the `/register/admin` page. This path is
**disabled by default** and only works when:

1. `ADMIN_REGISTRATION_SECRET` is set in `server/.env`, and
2. `ADMIN_REGISTRATION_ENABLED` is not `false`.

The request must include the matching `adminSecret`, compared in constant time.
Once your initial administrator is set up, unset `ADMIN_REGISTRATION_SECRET`
(or set `ADMIN_REGISTRATION_ENABLED=false`) to close the registration path.
The secret is never hardcoded in or exposed by the frontend.

---

## Mechanic accounts

Mechanics can obtain a login account in two ways:

1. **Self-registration** — a mechanic registers at `/register/mechanic`
   (`POST /api/auth/register/mechanic`). This creates a linked `user` account
   (role `mechanic`) and a `Mechanic` record in the **`Pending`** approval state.
   The account cannot sign in until an administrator approves it.
2. **Administrator creation** — an administrator adds the mechanic (optionally
   with a **Login Password**, or later via **Create Login** /
   `POST /api/admin/mechanics/:id/account`). These accounts are created
   **`Approved`** by default.

An administrator approves or rejects a mechanic with
`PUT /api/admin/mechanics/:id/approval` (`Approved` / `Rejected`), available as
**Approve** / **Reject** actions in the admin mechanic list.

Login and the mechanic portal both enforce the approval state, returning a clear
message (`MECHANIC_PENDING`, `MECHANIC_REJECTED`, `MECHANIC_INACTIVE`) for
mechanic accounts that are pending, rejected, or inactive. A rejected or
unapproved mechanic is set to `Inactive` so they cannot be assigned new work.

A mechanic manages their own availability between **`Available`** and **`Busy`**
only. `Inactive` is an administrator action (it blocks portal access), so it is
intentionally rejected on the self-service profile endpoint to prevent a mechanic
from locking themselves out.

---

## API overview

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | public | Register a user |
| POST | `/auth/register/mechanic` | public | Self-register a mechanic (created `Pending`) |
| POST | `/auth/register/admin` | public + secret | Self-register an admin (requires `ADMIN_REGISTRATION_SECRET`) |
| POST | `/auth/login` | public | Log in, returns a JWT (rate limited) |
| GET  | `/auth/profile` | token | Current user profile |
| PUT  | `/auth/profile` | token | Update username / change password |

### Vehicles
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/vehicles` | token | Register a vehicle |
| GET  | `/vehicles/my-vehicles` | token | List the caller's vehicles |
| PUT  | `/vehicles/:id` | owner | Update a vehicle |
| DELETE | `/vehicles/:id` | owner | Delete a vehicle (409 if referenced) |

### Service requests
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/service-requests` | token | Create a request |
| GET  | `/service-requests/my-requests` | token | List the caller's requests |
| GET  | `/service-requests/history` | token | Completed service history |
| GET  | `/service-requests` | admin | List all requests |
| PUT  | `/service-requests/:id/assign` | admin | Assign a mechanic |
| PUT  | `/service-requests/:id/status` | admin | Update status (validated) |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET  | `/admin/dashboard` | admin | Aggregate statistics |
| GET  | `/admin/users` | admin | List users |
| DELETE | `/admin/users/:id` | admin | Soft-delete a user |
| POST | `/admin/mechanics` | admin | Create a mechanic (optional password creates a login) |
| GET  | `/admin/mechanics` | admin | List mechanics |
| PUT  | `/admin/mechanics/:id` | admin | Update a mechanic |
| PUT  | `/admin/mechanics/:id/approval` | admin | Approve or reject a mechanic (Pending/Approved/Rejected) |
| POST | `/admin/mechanics/:id/account` | admin | Create a login account for a mechanic |
| DELETE | `/admin/mechanics/:id` | admin | Delete a mechanic (409 if referenced) |

### Mechanic portal
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET  | `/mechanic/dashboard` | mechanic | Personal job statistics |
| GET  | `/mechanic/jobs` | mechanic | Jobs assigned to the caller |
| GET  | `/mechanic/jobs/:id` | mechanic | A single job (caller's only) |
| PUT  | `/mechanic/jobs/:id/status` | mechanic | Update a job's status |
| GET  | `/mechanic/profile` | mechanic | Mechanic profile |
| PUT  | `/mechanic/profile` | mechanic | Update phone / availability |

**Service status values**: `Pending`, `Assigned`, `In Progress`, `Completed`,
`Cancelled` (`Accepted` is retained for legacy compatibility).

---

## Testing

```bash
# both suites (from the project root)
npm test

# backend only (Jest + Supertest + mongodb-memory-server)
npm run test:server

# frontend only (Vitest + React Testing Library)
npm run test:client
```

The backend tests run against an **in-memory MongoDB** and never touch a real
database. The current suite covers 54 backend and 15 frontend tests.

---

## Linting and production build

```bash
npm --prefix client run lint
npm run build          # production frontend build (client/dist)
```---

## Security notes

- Passwords are hashed with bcrypt and never returned by the API.
- JWTs are signed with `JWT_SECRET`; the server also accepts a bare token for
  backward compatibility.
- `helmet` sets sensible HTTP security headers.
- Login and registration are protected by rate limiting (skipped only under the
  automated test environment). Automated tests issue many logins from a single
  IP, so the limiter is intentionally bypassed when `NODE_ENV === "test"`.
- The `auth` middleware re-checks the user on every request, so a token issued
  before soft-deletion stops working immediately.
- CORS is restricted to configured origins and rejects disallowed origins with a
  clean `403` (not a `500`).
- The service lifecycle is validated on every status update; `Completed` and
  `Cancelled` are terminal.
- Deletion is guarded: a vehicle or mechanic that is referenced by a service
  request returns `409 Conflict` rather than orphaning history.
- Administrator accounts cannot be deleted, and mechanic logins must be removed
  from the mechanics page (not the generic users endpoint) so the linked
  `Mechanic` record is never orphaned.
- The client drops a mechanic session automatically when the API reports the
  account has been revoked (`MECHANIC_*` codes) mid-session.
- User deletion is a **soft delete** to avoid destroying dependent vehicles and
  service requests. A full cascading deletion is a business decision and is not
  performed automatically.
- The JWT is stored in `localStorage` for demo simplicity. For higher security,
  a httpOnly-cookie based flow would be preferable; this is a documented
  trade-off rather than a migration performed here.

## Known limitations

- No refresh-token rotation; tokens expire after 1 hour. Logout is client-side
  (the token is discarded); there is no server-side token denylist.
- No image uploads or advanced filtering (intentionally out of scope).

---

## Manual action still required

- Provide real `server/.env` values (`MONGO_URI`, `JWT_SECRET`).
- Run the initial administrator bootstrap script once (see above).

# CMS YSA — Backend

This is the Node.js/Express backend for the YourStudyAbroad (YSA) CMS. It provides a REST API for:

- **Authentication** (`/api/auth`)
- **Student Applications** (`/api/applications`)
- **Document Upload & Management** (`/api/documents`)
- **Team Comments** (`/api/comments`)

Uploaded files are stored in `backend/uploads/` and served statically under `/uploads`.

---

## Table of Contents

- [Prerequisites](#prerequisites)  
- [Getting Started](#getting-started)  
- [Environment Variables](#environment-variables)  
- [Database Setup](#database-setup)  
- [Running the Server](#running-the-server)  
- [API Routes](#api-routes)  
- [File Uploads](#file-uploads)  
- [Error Handling & Logging](#error-handling--logging)

---

## Prerequisites

- Node.js ≥ 18  
- npm ≥ 9 (or yarn)  
- PostgreSQL server  
- pgAdmin (optional)  

---

## Getting Started

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-org/ysa-cms.git
   cd ysa-cms/backend
````

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Create uploads folder**

   ```bash
   mkdir uploads
   ```

4. **Configure environment**
   See [Environment Variables](#environment-variables)

5. **Run database migrations**
   *(If you use a migration tool; otherwise manually create tables.)*

---

## Environment Variables

Copy `.env.example` to `.env` in the `backend/` folder and update:

```ini
PORT=5400
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/cms_ysa
JWT_SECRET=your_jwt_secret_here
```

* **`PORT`** — The port Express listens on (default: 5400)
* **`DATABASE_URL`** — Postgres connection string
* **`JWT_SECRET`** — Secret for signing JSON Web Tokens

---

## Database Setup

Using pgAdmin or psql, create the `cms_ysa` database and run this SQL (example schema):

```sql
-- applications table
CREATE TABLE applications (
  id           SERIAL PRIMARY KEY,
  agent_id     INTEGER NOT NULL REFERENCES users(id),
  student_name TEXT    NOT NULL,
  mobile       TEXT    NOT NULL,
  email        TEXT    NOT NULL,
  country      TEXT    NOT NULL,
  state        TEXT    NOT NULL,
  university   TEXT    NOT NULL,
  course_name  TEXT    NOT NULL,
  course_url   TEXT,
  status       TEXT    NOT NULL DEFAULT 'draft',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- documents table
CREATE TABLE documents (
  id             SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id),
  type           TEXT    NOT NULL,
  file_url       TEXT    NOT NULL,
  status         TEXT    NOT NULL DEFAULT 'pending',
  comment        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- comments table
CREATE TABLE comments (
  id             SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id),
  document_id    INTEGER REFERENCES documents(id),
  user_id        INTEGER NOT NULL REFERENCES users(id),
  text           TEXT    NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- users table (for auth)
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  role         TEXT    NOT NULL,
  email        TEXT    UNIQUE NOT NULL,
  password_hash TEXT   NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Running the Server

```bash
npm run dev
# or
yarn dev
```

This will start the Express server with live‐reload (via nodemon).

---

## API Routes

All routes are prefixed with `/api`

### Auth

* `POST /api/auth/login`
* `POST /api/auth/register`

### Applications

* `GET    /api/applications`
* `GET    /api/applications/:id`
* `POST   /api/applications`
* `PATCH  /api/applications/:id`
* `DELETE /api/applications/:id`

### Documents

* `GET    /api/documents`
* `GET    /api/documents/:id`
* `POST   /api/documents`  (multipart/form-data)
* `PATCH  /api/documents/:id`
* `DELETE /api/documents/:id`

### Comments

* `GET  /api/comments`
* `GET  /api/comments/:id`
* `POST /api/comments`
* `DELETE /api/comments/:id`

---

## File Uploads

* Files are saved under `backend/uploads/`
* Served statically at:

  ```
  http://localhost:<PORT>/uploads/<filename>
  ```
* Filenames are sanitized (spaces → underscores, prepended with timestamp).

---

## Error Handling & Logging

* **Logger middleware** logs each incoming request.
* **Error handler** returns JSON `{ error: "..."} ` with proper status codes.

---


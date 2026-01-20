# Admin / Owner / Agent Panel (React Vite + Node + Postgres)

## Features
- Roles: **admin**, **owner**, **agent**
- Admin can create Owner
- Owner can create Agent + Tasks + Sets
- Agent can create Sets
- Set has `max_tasks` and enforces capacity when adding tasks
- JWT auth + role-based route protection (frontend) and RBAC (backend)

---

## 1) Requirements
- Node.js 18+
- PostgreSQL 12+
- npm

---

## 2) Database setup
Create database:
```bash
createdb adminpanel
```

Apply schema:
```bash
cd backend
psql adminpanel -f sql/schema.sql
```

---

## 3) Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and set your Postgres connection:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/adminpanel
JWT_SECRET=change_me_super_secret
PORT=5000
```

Seed the first admin:
```bash
npm run seed:admin -- "Super Admin" "admin@local.com" "admin123"
```

Run backend:
```bash
npm run dev
```

Backend: http://localhost:5000

---

## 4) Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env
```

Frontend env:
```
VITE_API_URL=http://localhost:5000
```

Run frontend:
```bash
npm run dev
```

Frontend: http://localhost:5173

---

## 5) Usage flow
1. Login as admin: `admin@local.com / admin123`
2. Admin -> Users -> create an Owner
3. Logout -> login as Owner -> create Agents + create Tasks + create Sets
4. Login as Agent -> create Sets and add tasks to sets (capacity enforced)

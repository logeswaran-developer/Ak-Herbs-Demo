# AK Herbs — Full-Stack Website (MERN)

This is the full-stack rebuild of the AK Herbs website, converted from the original
static HTML/CSS/JS demo into a real production-style application:

- **Frontend:** React (Vite) + React Router
- **Backend:** Node.js + Express (REST API)
- **Database:** MongoDB (via Mongoose)
- **Auth:** JWT tokens + bcrypt password hashing (separate Customer and Admin accounts)

The visual design (colors, fonts, layout, all page content) is preserved exactly as
in the original static site — only the data layer moved from `localStorage` to a
real database with a real API.

## Folder structure

```
akherbs-fullstack/
├── backend/          Express + MongoDB API
│   ├── config/db.js
│   ├── models/        User, Admin, Product, Contact
│   ├── routes/         auth, admin, products, contact, cart, wishlist
│   ├── middleware/auth.js   JWT verification + role guards
│   ├── seed/seedProducts.js  loads the original 12 demo products
│   └── server.js
└── frontend/         React (Vite) client
    └── src/
        ├── pages/      Home, Products, About, Contact, Login, Register,
        │                AdminLogin, AdminRegister, Account, AdminDashboard
        ├── components/  Header, Footer, Layout, route guards
        ├── context/AuthContext.jsx
        ├── api/axios.js
        └── styles/style.css   (original stylesheet, unchanged)
```

## 1. Prerequisites

- Node.js 18+ and npm
- A MongoDB database — either:
  - Local MongoDB running on `mongodb://127.0.0.1:27017`, or
  - A free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) (recommended if you don't want to install MongoDB locally)

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/akherbs      # or your Atlas connection string
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
ADMIN_ACCESS_CODE=AKHERBS-ADMIN
CLIENT_ORIGIN=http://localhost:5173
```

Seed the original product catalogue (12 demo products):

```bash
npm run seed
```

Start the API:

```bash
npm run dev        # with auto-restart (nodemon)
# or
npm start
```

The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health` to confirm it's up.

## 3. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies all `/api/*` requests
to the backend automatically (see `vite.config.js`), so no extra config is
needed for local development.

## 4. Creating accounts

- **Customer:** Register at `/register`, then log in at `/login`.
- **Admin:** Register at `/admin-register` using the access code from your
  `.env` (`ADMIN_ACCESS_CODE`, default `AKHERBS-ADMIN`), then log in at `/admin-login`.
  From the admin dashboard you can add/remove products and see registered customers.

There are no pre-seeded accounts — passwords are hashed with bcrypt and stored
in MongoDB, so (unlike the original demo) you must register a real account.

## 5. API overview

| Method | Route                    | Access          | Purpose                          |
|--------|---------------------------|-----------------|-----------------------------------|
| POST   | /api/auth/register         | public          | Customer sign up                  |
| POST   | /api/auth/login             | public          | Customer login                    |
| GET    | /api/auth/me                | customer        | Current profile + cart/wishlist   |
| POST   | /api/admin/register         | public + code   | Admin sign up                     |
| POST   | /api/admin/login             | public          | Admin login                       |
| GET    | /api/admin/stats             | admin           | Dashboard counters                 |
| GET    | /api/admin/users              | admin           | List registered customers          |
| GET    | /api/products                  | public          | List products (supports ?cat=)     |
| POST   | /api/products                   | admin           | Add a product                      |
| DELETE | /api/products/:id                 | admin           | Remove a product                   |
| POST   | /api/contact                       | public          | Submit enquiry form                |
| GET    | /api/contact                        | admin           | View submitted enquiries           |
| GET/POST/DELETE | /api/cart[/:id]            | customer        | Manage cart                        |
| GET/POST | /api/wishlist[/:id]               | customer        | Toggle/view wishlist               |

## 6. Deploying

- **Backend:** deploy to Render / Railway / Fly.io / a VPS. Set the same
  environment variables from `.env.example`, pointed at your production
  MongoDB (e.g. Atlas) and update `CLIENT_ORIGIN` to your deployed frontend URL.
- **Frontend:** `npm run build` produces a static `dist/` folder — deploy it to
  Vercel / Netlify / any static host. Set `VITE_API_URL` to your deployed
  backend's URL (e.g. `https://your-api.onrender.com/api`) before building.

## 7. What changed vs. the original static demo

- Accounts, passwords, and products now live in MongoDB instead of browser
  `localStorage` — shared across every visitor and device.
- Passwords are hashed with bcrypt, never stored in plain text.
- Admin actions (add/remove products) are visible to every visitor immediately.
- Login/session state uses signed JWTs instead of an unprotected local flag.

# ShopEase — Fashion & Clothing E-Commerce

A beginner-friendly full-stack starter project using React + Vite, Node.js + Express, and MongoDB.

## Features
- Responsive fashion storefront
- Product search, category filters, sorting
- Add/remove products and change cart quantities
- JWT-based registration/login
- MongoDB product catalogue and order storage
- Checkout form (demo order flow)
- Seed script for sample products

> **Payment note:** Checkout creates a demo order. No real payment is collected. For real payments, integrate a provider such as Razorpay or Stripe on the server and verify payment webhooks before marking orders as paid.

## Requirements
- Node.js 20+ (LTS recommended)
- npm
- MongoDB local installation OR MongoDB Atlas connection string
- VS Code

## Folder structure
```text
shopease-ecommerce/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       └── styles.css
└── server/
    ├── package.json
    ├── .env.example
    └── src/
        ├── server.js
        ├── models.js
        ├── middleware.js
        ├── seed.js
        └── routes/
            ├── products.js
            ├── auth.js
            └── orders.js
```

## Run in VS Code

### 1. Start MongoDB
Option A: use MongoDB Atlas and copy your connection string.
Option B: run MongoDB locally, then use `mongodb://127.0.0.1:27017/shopease`.

### 2. Configure backend
Open a terminal in VS Code:
```bash
cd server
npm install
```
Copy `.env.example` to `.env` and set `MONGO_URI` and a long random `JWT_SECRET`.
```bash
npm run seed
npm run dev
```
Backend runs at `http://localhost:5000`.

### 3. Start frontend
Open a **second** VS Code terminal:
```bash
cd client
npm install
npm run dev
```
Open the local URL printed by Vite, usually `http://localhost:5173`.

## Test the app
- Browse and filter products.
- Add an item to the bag and change its quantity.
- Register or log in to get a JWT.
- Complete the demo checkout. The order is saved to MongoDB.
- If you get a CORS error, confirm the frontend URL matches `CLIENT_URL` in the backend `.env`.

## Environment variables
See `server/.env.example`. Never commit `.env`, JWT secrets, or database credentials to GitHub.

## Deployment overview
### MongoDB Atlas
1. Create a free cluster and database user.
2. Configure Network Access for your deployment environment.
3. Copy the connection string and replace the password/database name.
4. Keep the URI private as a backend environment variable.

### Backend on Render
1. Push this project to GitHub.
2. Create a new **Web Service** from the repository.
3. Set Root Directory to `server`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your deployed frontend URL), and `NODE_ENV=production`.
7. Deploy. Copy the Render service URL.

### Frontend on Vercel or Netlify
1. Create a project from the same GitHub repository.
2. Set Root Directory to `client`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `VITE_API_URL` = your backend URL plus `/api` (example: `https://your-service.onrender.com/api`).
6. Deploy and test login, products, and demo checkout.

### Important deployment checks
- Add the frontend domain to `CLIENT_URL` on the backend.
- Do not use `localhost` for the deployed `VITE_API_URL`.
- Run `npm run seed` once against the production database if the catalogue is empty. Do not expose seed endpoints publicly.
- Use a real payment provider only after implementing server-side payment creation and signature/webhook verification.

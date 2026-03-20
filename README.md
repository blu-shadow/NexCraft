# 1000 Din Web App 🚀

A full-stack MERN web application for web design, development, app creation, game development, and hardware repair services.

## Tech Stack
- **Frontend**: React + Vite + CSS Variables
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt

## Project Structure
```
1000-din-web-app/
├── client/          # React Frontend
│   ├── public/
│   └── src/
│       ├── admin/       # Admin Panel Pages & Components
│       ├── components/  # Reusable UI Components
│       ├── context/     # React Context (Auth, Theme, Site)
│       ├── hooks/       # Custom Hooks
│       ├── pages/       # Public Pages
│       ├── services/    # API Call Functions
│       ├── styles/      # Global CSS
│       └── utils/       # Helper Functions
│
└── server/          # Node.js + Express Backend
    ├── config/      # DB & Cloudinary config
    ├── controllers/ # Route Logic
    ├── middleware/  # Auth, Upload Middleware
    ├── models/      # MongoDB Schemas
    ├── routes/      # API Routes
    └── utils/       # Helpers (Token, Email)
```

## Getting Started

### 1. Server Setup
```bash
cd server
npm install
# Edit .env with your MongoDB URI
npm run dev
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```

### URLs
- Client: http://localhost:5173
- Server: http://localhost:5000
- Admin: http://localhost:5173/admin/login

## Environment Variables

### Server `.env`
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_EMAIL=admin@1000din.com
ADMIN_PASSWORD=admin123456
```

### Client `.env`
```
VITE_API_URL=http://localhost:5000/api
```

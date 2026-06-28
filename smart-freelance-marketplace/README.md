# Smart Freelance Marketplace

A full-stack MERN application where clients can post jobs and freelancers can apply.

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | React 18, Vite, React Router v6, Axios  |
| Backend    | Node.js, Express 4                      |
| Database   | MongoDB, Mongoose                       |
| Auth       | JWT (jsonwebtoken), bcryptjs            |
| Styling    | Custom CSS (design tokens, dark theme)  |

---

## Folder Structure

```
smart-freelance-marketplace/
├── package.json              ← root scripts (concurrently)
│
├── backend/
│   ├── server.js             ← Express app entry point
│   ├── .env.example          ← copy to .env and fill in
│   ├── config/
│   │   └── db.js             ← MongoDB connection
│   ├── middleware/
│   │   └── auth.js           ← JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   └── Application.js
│   └── routes/
│       ├── auth.js           ← /api/auth/register, /login, /me
│       ├── jobs.js           ← /api/jobs CRUD
│       └── applications.js   ← /api/applications CRUD
│
└── frontend/
    ├── index.html
    ├── vite.config.js        ← proxies /api → localhost:5000
    └── src/
        ├── main.jsx
        ├── App.jsx           ← routes
        ├── styles.css        ← all styles (design tokens)
        ├── api/
        │   └── axios.js      ← Axios instance with base URL
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   └── JobCard.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Home.jsx          ← browse + search jobs
            ├── PostJob.jsx
            ├── JobDetail.jsx     ← apply modal included
            ├── JobApplications.jsx
            └── Dashboard.jsx
```

---

## Setup & Running

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) **or** a MongoDB Atlas URI

### 1. Clone & install

```bash
# From the project root
npm run setup
```

This installs root dependencies, backend dependencies, and frontend dependencies.

### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-freelance
JWT_SECRET=change_this_to_a_long_random_string
NODE_ENV=development
```

### 3. Run both servers

```bash
# From the project root
npm run dev
```

- Backend:  http://localhost:5000
- Frontend: http://localhost:3000

Or run them separately:

```bash
npm run dev:backend   # terminal 1
npm run dev:frontend  # terminal 2
```

---

## API Reference

### Auth
| Method | Route               | Auth | Description       |
| ------ | ------------------- | ---- | ----------------- |
| POST   | /api/auth/register  | ✗    | Register user     |
| POST   | /api/auth/login     | ✗    | Login → JWT       |
| GET    | /api/auth/me        | ✓    | Get current user  |

### Jobs
| Method | Route                    | Auth | Description               |
| ------ | ------------------------ | ---- | ------------------------- |
| GET    | /api/jobs                | ✗    | List open jobs            |
| GET    | /api/jobs/my             | ✓    | My posted jobs            |
| GET    | /api/jobs/:id            | ✗    | Get single job            |
| POST   | /api/jobs                | ✓    | Create job                |
| PATCH  | /api/jobs/:id/status     | ✓    | Update job status (owner) |
| DELETE | /api/jobs/:id            | ✓    | Delete job (owner)        |

### Applications
| Method | Route                        | Auth | Description                       |
| ------ | ---------------------------- | ---- | --------------------------------- |
| POST   | /api/applications            | ✓    | Apply for a job                   |
| GET    | /api/applications/my         | ✓    | My applications (as freelancer)   |
| GET    | /api/applications/job/:jobId | ✓    | All apps for a job (owner only)   |
| PATCH  | /api/applications/:id        | ✓    | Accept/reject application         |

---

## Features

- **JWT Auth** – register/login, token stored in localStorage, auto-attached to all requests
- **Browse & Search** – filter jobs by keyword and category
- **Post Jobs** – authenticated users post jobs with budget, skills, category, deadline
- **Apply** – modal form with cover letter and proposed rate; duplicate applications blocked
- **Dashboard** – stats overview, posted jobs management, application tracking
- **Owner controls** – accept/reject applications, delete jobs
- **Protected routes** – unauthenticated users redirected to login
- **Dark UI** – custom CSS with design tokens, fully responsive

# 📚 CVNHS Electronic Research Library

A modern, full-stack web application for managing and sharing student research papers at **Catubig Valley National High School**.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)

---

## ✨ Features

- 📄 **Research Paper Management** – Upload, organize, and download PDF research papers
- 🏷️ **Strand Organization** – Categorize papers by academic strand (STEM, ABM, HUMSS, etc.)
- 👥 **User Management** – Role-based access (Admin/Viewer) with secure authentication
- 📊 **Analytics Dashboard** – Track downloads, view statistics, and monitor activity
- 🔍 **Search & Filter** – Find papers by title, author, keywords, or strand
- 🌙 **Dark Mode** – Toggle between light and dark themes

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or remote)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cvnhs_electronic_research_library

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure your environment variables
node server.js

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Default Login

| Username | Password |
|----------|----------|
| `admin`  | `admin`  |

> ⚠️ **Change the default password after first login!**

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Express.js, Node.js |
| Database | MongoDB with Mongoose |
| State | Zustand |
| Auth | express-session, bcrypt |

---

## 📁 Project Structure

```
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── server.js        # Express API server
│   └── .env             # Environment config
├── frontend/
│   ├── src/
│   │   ├── pages/       # Route components
│   │   ├── components/  # UI components
│   │   └── store/       # State management
│   └── package.json
├── DOCUMENTATION.md     # Full technical documentation
└── DEPLOYMENT_GUIDE.md  # Production deployment guide
```

---

## 🔧 Configuration

Create a `.env` file in the `backend/` folder:

```env
MONGO_URI=mongodb://localhost:27017/cvnhs_research_library
PORT=5000
SESSION_SECRET=your_secret_key_here
```

---

## 📖 Documentation

For detailed documentation including API reference, database schema, and architecture diagrams, see:

- 📘 [DOCUMENTATION.md](./DOCUMENTATION.md) – Comprehensive technical docs
- 🚀 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) – Production deployment steps

---

## 🖥️ Screenshots

| Home Page | Admin Dashboard |
|-----------|-----------------|
| Hero section with search and featured papers | Statistics, charts, and activity tracking |

---

## 📝 License

This project was developed for **Catubig Valley National High School** as an internal research archive system.


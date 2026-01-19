# CVNHS Electronic Research Library - Comprehensive Documentation

> **A digital archive system for Catubig Valley National High School's student research papers**

---

## 📋 Executive Summary

The **CVNHS Electronic Research Library** is a web-based application designed to digitize, organize, and share student research papers from Catubig Valley National High School. It serves as a centralized repository where students, teachers, and administrators can browse, search, and access academic research organized by academic strands.

### Who Is This For?

| Role | What They Can Do |
|------|------------------|
| **Students** | Browse and download research papers for reference and inspiration |
| **Teachers** | Access student work, track submissions, and guide research |
| **Administrators** | Manage users, organize strands, upload papers, and view analytics |

---

## 🎯 What Does This System Do?

```mermaid
flowchart TB
    subgraph Public["📚 Public Library (For Students/Teachers)"]
        A[Browse Papers] --> B[Search by Title/Author]
        A --> C[Filter by Strand]
        B --> D[View Paper Details]
        C --> D
        D --> E[Download PDF]
    end
    
    subgraph Admin["⚙️ Admin Panel (For Administrators)"]
        F[Dashboard] --> G[View Statistics]
        F --> H[Manage Papers]
        F --> I[Manage Strands]
        F --> J[Manage Users]
        H --> K[Upload/Edit/Delete Papers]
        I --> L[Add/Edit Academic Strands]
        J --> M[Create/Manage Accounts]
    end
    
    Login[Login Page] --> Public
    Login --> Admin
```

### Core Features

#### 1. 📖 Research Paper Management
- **Upload** research papers as PDF files
- **Organize** papers by academic strand (STEM, ABM, HUMSS, etc.)
- **Track** download counts and statistics
- **Feature** outstanding papers on the homepage

#### 2. 🏷️ Strand Organization
- Create and manage academic strands/tracks
- Each strand has a name, description, and icon
- Papers are categorized under their respective strands

#### 3. 👥 User Management
- **Admins**: Full access to all features
- **Viewers**: Can browse and download papers
- Session-based login with automatic session expiry

#### 4. 📊 Analytics Dashboard
- Total papers in the library
- Download statistics
- Activity tracking
- Visual charts for school year distribution

---

## 🏗️ Technical Architecture

### System Overview

```mermaid
flowchart LR
    subgraph Client["🖥️ User's Browser"]
        React["React Application"]
    end
    
    subgraph Server["🖧 Server Computer"]
        Express["Express.js Backend"]
        MongoDB[("MongoDB Database")]
        PDFs["📁 PDF Storage"]
    end
    
    React <-->|HTTP Requests| Express
    Express <-->|Data| MongoDB
    Express <-->|Files| PDFs
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | User interface |
| **Styling** | Tailwind CSS + shadcn/ui | Modern, responsive design |
| **State** | Zustand | Application state management |
| **Backend** | Express.js (Node.js) | API server |
| **Database** | MongoDB | Data storage |
| **Authentication** | express-session + bcrypt | Secure login |
| **File Storage** | Local filesystem (APPDATA) | PDF documents |

---

## 📁 Project Structure

```
cvnhs_electronic_research_library/
├── 📁 backend/                  # Server-side code
│   ├── models/                  # Database schemas
│   │   ├── User.js              # User accounts
│   │   ├── Strand.js            # Academic strands
│   │   └── ResearchPaper.js     # Research papers
│   ├── server.js                # Main API server (860 lines)
│   ├── .env                     # Configuration secrets
│   └── package.json             # Dependencies
│
├── 📁 frontend/                 # Client-side code
│   ├── src/
│   │   ├── pages/               # Page components
│   │   │   ├── Index.tsx        # Home page
│   │   │   ├── AllPapersPage.tsx
│   │   │   ├── PaperDetailPage.tsx
│   │   │   ├── StrandsPage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   └── admin/           # Admin panel pages
│   │   │       ├── AdminDashboardPage.tsx
│   │   │       ├── AdminPapersPage.tsx
│   │   │       ├── AdminStrandsPage.tsx
│   │   │       └── AdminUsersPage.tsx
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # 49 shadcn components
│   │   │   ├── home/            # Homepage sections
│   │   │   ├── admin/           # Admin UI elements
│   │   │   └── layout/          # Header, Footer, etc.
│   │   ├── store/               # State management
│   │   │   ├── adminStore.ts    # Auth & admin state
│   │   │   └── useStore.ts      # General app state
│   │   └── types/               # TypeScript definitions
│   └── package.json
│
└── DEPLOYMENT_GUIDE.md          # Setup instructions
```

---

## 💾 Database Structure

### Collections (Tables)

```mermaid
erDiagram
    User ||--o{ Session : has
    Strand ||--o{ ResearchPaper : contains
    
    User {
        ObjectId _id
        string username "Unique login name"
        string password "Hashed with bcrypt"
        string full_name "Display name"
        string role "admin or viewer"
        date createdAt
    }
    
    Strand {
        ObjectId _id
        string short "e.g., STEM, ABM"
        string name "Full strand name"
        string description
        string icon "Icon name for UI"
        date createdAt
    }
    
    ResearchPaper {
        ObjectId _id
        string title
        array authors "firstName, lastName, etc."
        string abstract
        array keywords
        string adviser
        string school_year "e.g., 2023 - 2024"
        string grade_section
        ObjectId strand_id "Links to Strand"
        boolean is_featured
        number download_count
        string pdf_path "Filename in storage"
        date createdAt
    }
```

---

## 🔌 API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/login` | Login with username/password | No |
| `POST` | `/api/auth/logout` | End session | Yes |
| `GET` | `/api/auth/me` | Get current user info | Yes |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create new user |
| `PUT` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Delete user |
| `DELETE` | `/api/users/:id/sessions` | Kick user (end their sessions) |

### Research Papers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/papers` | List all papers |
| `GET` | `/api/papers/:id` | Get single paper details |
| `POST` | `/api/papers` | Upload new paper (with PDF) |
| `PUT` | `/api/papers/:id` | Update paper |
| `DELETE` | `/api/papers/:id` | Delete paper and file |
| `GET` | `/api/papers/view/:id` | Stream PDF in browser |
| `GET` | `/api/papers/download/:id` | Download PDF (increments counter) |

### Strands

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/strands` | List all strands with paper counts |
| `POST` | `/api/strands` | Create new strand |
| `PUT` | `/api/strands/:id` | Update strand |
| `DELETE` | `/api/strands/:id` | Delete strand |

### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Public stats (papers, downloads, strands) |
| `GET` | `/api/dashboard/stats` | Detailed admin statistics |

---

## 🖥️ User Interface Pages

### Public Pages (Require Login)

| Page | URL | Purpose |
|------|-----|---------|
| **Home** | `/home` | Hero section, featured papers, strand showcase |
| **All Papers** | `/papers` | Browse and search all papers |
| **Paper Details** | `/papers/:id` | View paper info and download PDF |
| **Strands** | `/strands` | Browse papers by academic strand |
| **About** | `/about` | Information about the library |

### Admin Pages (Require Admin Role)

| Page | URL | Purpose |
|------|-----|---------|
| **Login** | `/` or `/admin/login` | Admin authentication |
| **Dashboard** | `/admin` | Statistics and overview |
| **Papers** | `/admin/papers` | Manage research papers |
| **Strands** | `/admin/strands` | Manage academic strands |
| **Users** | `/admin/users` | Manage user accounts |

---

## 🔐 Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt (10 salt rounds)
2. **Session Management**: 
   - Sessions stored in MongoDB
   - 15-minute expiry with rolling refresh
   - HTTP-only cookies
3. **Route Protection**: All sensitive routes require authentication
4. **Input Validation**: File type checking (PDF only), size limits (50MB)
5. **Self-Protection**: Users cannot delete their own accounts or kick themselves

---

## 🚀 Quick Start Guide

### For Development

```bash
# 1. Start MongoDB (must be running)

# 2. Backend Setup
cd backend
npm install
node server.js

# 3. Frontend Setup (new terminal)
cd frontend
npm install
npm run dev
```

### Default Admin Account

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin` |

> ⚠️ **Important**: Change the default password immediately after first login!

---

## 📦 Where Are Files Stored?

| Type | Location |
|------|----------|
| **PDF Files** | `%APPDATA%/cvnhs_electronic_research_library/cvnhs_research_papers/` |
| **Database** | MongoDB (local or configured URI) |
| **Sessions** | MongoDB `sessions` collection |

---

## 🎨 UI Components Library

The frontend uses **shadcn/ui**, providing 49+ pre-built components:

- Buttons, Inputs, Forms
- Modals (Dialogs)
- Tables with sorting
- Charts (via Recharts)
- Toasts for notifications
- And many more...

---

## 📱 Responsive Design

The application is fully responsive:

| Device | Support |
|--------|---------|
| Desktop | ✅ Full layout |
| Tablet | ✅ Adapted grid |
| Mobile | ✅ Compact navigation |

---

## 🔧 Configuration

### Environment Variables (`.env`)

```env
# MongoDB connection string
MONGO_URI=mongodb://localhost:27017/cvnhs_research_library

# Server port
PORT=5000

# Session encryption key (keep secret!)
SESSION_SECRET=your_secret_key_here
```

---

## 📊 Feature Summary

| Feature | Status |
|---------|--------|
| User Authentication | ✅ Implemented |
| Role-Based Access | ✅ Admin/Viewer |
| Paper CRUD Operations | ✅ Full support |
| PDF Upload/Download | ✅ Working |
| Search Functionality | ✅ By title, author, keyword |
| Download Tracking | ✅ Automatic counting |
| Strand Management | ✅ Full CRUD |
| Admin Dashboard | ✅ With charts |
| Session Management | ✅ With kick feature |
| Dark Mode | ✅ Toggle available |

---

## 📞 Support Information

This system was developed for **Catubig Valley National High School** as an electronic research archive. For technical support or feature requests, please contact the school's IT department.

---

*Documentation generated on January 2026*

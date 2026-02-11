# 💼 Job Portal System – CDAC Project

An **Online Job Portal** web application that connects **Job Seekers** and **Employers**. Job seekers can search, apply for jobs, upload resumes, and get **AI-powered resume analysis**. Employers can post jobs, manage listings, and review applicants. The platform also aggregates **external job listings** from multiple APIs.

> Built as part of the **CDAC (Centre for Development of Advanced Computing)** curriculum using a full-stack architecture.

---

## 🛠️ Technology Stack

| Layer       | Technology                                                                 |
|-------------|----------------------------------------------------------------------------|
| **Frontend**  | React 19, Vite 7, TailwindCSS 4, React Router DOM 7, Axios, jwt-decode |
| **Backend**   | ASP.NET Core (.NET 8), Entity Framework Core, JWT Authentication, Swagger |
| **Database**  | MySQL (via Pomelo EF Core provider)                                      |
| **AI**        | Google Gemini AI (resume analysis)                                       |
| **External APIs** | Remotive, Arbeitnow, JSearch (external job aggregation)             |
| **Tools**     | Visual Studio / VS Code, MySQL Workbench, Git & GitHub                   |

---

## 📁 Project Structure

```
JobPortal/
├── Backend/
│   └── JobPortal.API/
│       ├── JobPortal.API.sln          # Solution file
│       └── JobPortal.API/
│           ├── Controllers/           # API Controllers
│           │   ├── AuthController.cs         # Login & Registration
│           │   ├── JobsController.cs         # CRUD for jobs
│           │   ├── JobApplicationsController.cs  # Apply & manage applications
│           │   ├── ProfileController.cs      # User profile management
│           │   ├── ResumeController.cs       # Resume upload
│           │   ├── AIController.cs           # Gemini AI resume analysis
│           │   └── ExternalJobsController.cs # External job search
│           ├── Models/                # Entity models
│           ├── DTOs/                  # Data Transfer Objects
│           ├── Data/                  # EF Core DbContext
│           ├── Services/             # Business logic & external APIs
│           ├── Migrations/           # EF Core database migrations
│           ├── Uploads/              # Uploaded resumes storage
│           ├── .env.example          # Backend env template
│           ├── Program.cs            # App entry point & configuration
│           └── appsettings.json      # App settings (uses env variables)
│
├── Frontend/
│   └── jobportal-ui/
│       ├── src/
│       │   ├── api/                  # API service layer (Axios)
│       │   │   ├── axios.js          # Axios instance config
│       │   │   ├── authApi.js        # Auth API calls
│       │   │   ├── jobsApi.js        # Jobs API calls
│       │   │   └── resumeApi.js      # Resume API calls
│       │   ├── components/           # Reusable components
│       │   ├── context/              # React context (AuthContext)
│       │   ├── pages/                # Page components
│       │   │   ├── Home.jsx          # Landing page
│       │   │   ├── Jobs.jsx          # Browse jobs
│       │   │   ├── ExternalJobs.jsx  # External job listings
│       │   │   ├── auth/             # Login & Register pages
│       │   │   ├── employer/         # Employer Dashboard
│       │   │   └── jobseeker/        # JobSeeker Dashboard & Profile
│       │   ├── App.jsx               # Routes & app layout
│       │   └── main.jsx              # Entry point
│       ├── .env.example              # Frontend env template
│       ├── package.json
│       └── vite.config.js
│
├── CDAC_JobPortal_README.md
└── .gitignore
```

---

## 🧩 Modules & Features

### 👤 Job Seeker
- Registration & Login (JWT-based)
- Profile management (education, experience, skills, location preference)
- Resume upload (PDF support)
- **AI-powered resume analysis** (via Google Gemini) — extracts skills, recommends roles, suggests improvements
- Search & browse internal jobs
- Search external jobs (Remotive, Arbeitnow, JSearch)
- Apply for jobs & track application status

### 🏢 Employer
- Registration & Login (JWT-based)
- Company profile management (name, description, website, logo)
- Post, update, and delete job listings
- View applicants for posted jobs
- Update application status (Accept/Reject)
- Download applicant resumes

### 🔐 Authentication & Security
- JWT Bearer token authentication
- Role-based access control (`jobseeker` / `employer`)
- Protected routes on frontend
- Password hashing

---

## 🗄️ Database Schema (MySQL)

| Table                | Description                                    |
|----------------------|------------------------------------------------|
| `Users`              | All users (jobseekers, employers) with role    |
| `JobSeekerProfiles`  | Jobseeker details (education, skills, resume)  |
| `EmployerProfiles`   | Employer/company details                       |
| `Jobs`               | Job listings posted by employers               |
| `JobApplications`    | Applications submitted by jobseekers           |
| `ResumeAnalyses`     | AI-generated resume analysis results           |

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v18+)
- **.NET SDK** (v8.0+)
- **MySQL Server** (v8.0+)
- **Git**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/chinmayy19/JobPortal.git
cd JobPortal
```

### 2️⃣ Backend Setup

#### a) Navigate to the backend project

```bash
cd Backend/JobPortal.API/JobPortal.API
```

#### b) Create the `.env` file

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DB_SERVER=localhost
DB_NAME=jobportal_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_KEY=your_super_secret_key_at_least_32_characters_long
JWT_ISSUER=JobPortal.API
JWT_AUDIENCE=JobPortal.Client
JWT_EXPIRY_MINUTES=60

# Gemini AI Configuration (for resume analysis)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-pro

# JSearch API Configuration (for external jobs)
JSEARCH_API_KEY=your_jsearch_api_key
```

> **Note:** Gemini and JSearch API keys are optional — the core features will work without them, but AI resume analysis and JSearch external jobs won't be available.

#### c) Create the MySQL database

```sql
CREATE DATABASE jobportal_db;
```

#### d) Apply database migrations

```bash
dotnet ef database update
```

> If `dotnet ef` is not installed, run: `dotnet tool install --global dotnet-ef`

#### e) Run the backend

```bash
dotnet run
```

The backend API will be available at: **`https://localhost:7109`**  
Swagger UI: **`https://localhost:7109/swagger`**

---

### 3️⃣ Frontend Setup

#### a) Navigate to the frontend project

```bash
cd Frontend/jobportal-ui
```

#### b) Create the `.env` file

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=https://localhost:7109/api
```

#### c) Install dependencies & run

```bash
npm install
npm run dev
```

The frontend will be available at: **`http://localhost:5173`**

---

## 🔗 API Endpoints Overview

| Endpoint                  | Method | Description                    | Auth Required |
|---------------------------|--------|--------------------------------|---------------|
| `/api/Auth/register`      | POST   | Register new user              | No            |
| `/api/Auth/login`         | POST   | Login & get JWT token          | No            |
| `/api/Jobs`               | GET    | Get all jobs                   | No            |
| `/api/Jobs`               | POST   | Create a job                   | Employer      |
| `/api/Jobs/{id}`          | PUT    | Update a job                   | Employer      |
| `/api/Jobs/{id}`          | DELETE | Delete a job                   | Employer      |
| `/api/JobApplications`    | POST   | Apply to a job                 | JobSeeker     |
| `/api/Profile`            | GET    | Get user profile               | Yes           |
| `/api/Profile`            | PUT    | Update profile                 | Yes           |
| `/api/Resume/upload`      | POST   | Upload resume                  | JobSeeker     |
| `/api/AI/analyze-resume`  | POST   | AI resume analysis             | JobSeeker     |
| `/api/ExternalJobs`       | GET    | Search external job listings   | No            |
| `/health`                 | GET    | Health check                   | No            |

---

## 🏗️ System Architecture

```
┌─────────────────────┐       ┌─────────────────────────┐       ┌──────────────┐
│   React Frontend    │◄─────►│   ASP.NET Core Web API  │◄─────►│    MySQL     │
│   (Vite + Tailwind) │ Axios │   (JWT + EF Core)       │  EF   │   Database   │
│   Port: 5173        │       │   Port: 7109            │ Core  │              │
└─────────────────────┘       └──────────┬──────────────┘       └──────────────┘
                                         │
                              ┌──────────┴──────────────┐
                              │    External Services     │
                              ├─────────────────────────┤
                              │ • Google Gemini AI       │
                              │ • Remotive Jobs API      │
                              │ • Arbeitnow Jobs API     │
                              │ • JSearch Jobs API       │
                              └─────────────────────────┘
```

---

## ⚙️ Environment Variables Reference

### Backend (`.env`)

| Variable             | Required | Description                              |
|----------------------|----------|------------------------------------------|
| `DB_SERVER`          | ✅ Yes   | MySQL server address                     |
| `DB_NAME`            | ✅ Yes   | Database name                            |
| `DB_USER`            | ✅ Yes   | Database username                        |
| `DB_PASSWORD`        | ✅ Yes   | Database password                        |
| `JWT_KEY`            | ✅ Yes   | Secret key for JWT (min 32 chars)        |
| `JWT_ISSUER`         | ✅ Yes   | JWT issuer (default: `JobPortal.API`)    |
| `JWT_AUDIENCE`       | ✅ Yes   | JWT audience (default: `JobPortal.Client`) |
| `JWT_EXPIRY_MINUTES` | ✅ Yes   | Token expiry time in minutes             |
| `GEMINI_API_KEY`     | ❌ No    | Google Gemini API key (for AI features)  |
| `GEMINI_MODEL`       | ❌ No    | Gemini model name                        |
| `JSEARCH_API_KEY`    | ❌ No    | JSearch API key (for external jobs)      |

### Frontend (`.env`)

| Variable              | Required | Description                        |
|-----------------------|----------|------------------------------------|
| `VITE_API_BASE_URL`   | ✅ Yes   | Backend API URL with `/api` suffix |

---

## 🖥️ Screenshots

> _Add screenshots of the application here (Home page, Job listings, Employer dashboard, etc.)_

---

## 🔮 Future Enhancements

- Email notifications for application updates
- Admin panel for platform management
- AI-based job recommendations
- Chat system between employers and jobseekers
- Cloud deployment (AWS: S3 + EC2 + RDS)

---

## 👤 Project Details

**Name:** Chinmay  
**Course:** CDAC (Centre for Development of Advanced Computing)  
**Project Type:** Academic Project  
**Repository:** [github.com/chinmayy19/JobPortal](https://github.com/chinmayy19/JobPortal)

---

## 📄 License

This project is developed for educational purposes only.

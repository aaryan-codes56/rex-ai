# RexAI – Your Smart AI-Powered Career Guidance Platform

## 🧠 Problem Statement
Students and professionals often struggle to identify the right career path and find relevant upskilling opportunities that align with their goals.  
They waste hours browsing through generic courses without personalized insights.

**RexAI** solves this by offering:
- 🎯 AI-powered career guidance  
- 📚 Personalized course recommendations  
- 🧾 An intelligent resume builder  

All in one platform - helping users make **informed and confident career decisions.**

---

## 🏗️ System Architecture

### **Architecture Flow**

### **Stack Overview**

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js with React Router |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT (JSON Web Token) |
| **Hosting** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## ⚙️ Key Features

### 🧾 **Authentication & Authorization**
- Secure user registration, login, and logout  
- JWT-based authentication  
- Role-based access control  

### 🧭 **AI Career Recommendation**
- Personalized career suggestions powered by **OpenAI API**

### 🎓 **Course Explorer**
- Browse curated courses by domain, skill, or provider  
- Advanced search, sort, filter, and pagination

### 💼 **Resume Builder**
- Build and download smart resumes  
- AI-powered enhancement suggestions  

### 🔁 **CRUD Operations**
- Manage user resumes, saved careers, and preferred courses  

### 🌐 **Frontend Routing**
- Pages: `Home`, `Login`, `Dashboard`, `Career Guide`, `Courses`, `Resume Builder`, `Profile`

### ☁️ **Hosting**
- Fully deployed and accessible online via:
  - **Frontend:** Vercel  
  - **Backend:** Render  
  - **Database:** MongoDB Atlas  

---

## 🧩 Tech Stack

| Layer | Technologies |
|--------|---------------|
| **Frontend** | React.js, React Router, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT-based Authentication |
| **AI Integration** | OpenAI API (for career guidance & resume enhancement) |
| **Hosting** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## 🔗 API Overview

| Endpoint | Method | Description | Access |
|-----------|---------|--------------|---------|
| `/api/auth/signup` | **POST** | Register a new user | Public |
| `/api/auth/login` | **POST** | Login and get JWT token | Public |
| `/api/careers/recommend` | **POST** | Get AI-based career recommendations | Authenticated |
| `/api/courses` | **GET** | Fetch all courses with search, sort, filter, and pagination | Authenticated |
| `/api/resume` | **POST** | Create or update resume | Authenticated |
| `/api/resume/:id` | **DELETE** | Delete user resume | Authenticated |
| `/api/user/:id` | **GET** | Fetch user profile and preferences | Authenticated |

---

1. Project Title
RexAI – Your Smart AI-Powered Career Guidance Platform

2. Problem Statement
Students and professionals often struggle to identify the right career path and find relevant upskilling opportunities that align with their goals. They waste hours browsing through generic courses without personalized insights.
RexAI solves this by offering AI-powered career guidance, personalized course recommendations, and an intelligent resume builder, all in one platform - helping users make informed and confident career decisions.

3. System Architecture
Architecture Flow:
 Frontend → Backend (API) → Database
Stack Details:
Layer
Technology
Frontend
React.js with React Router
Backend
Node.js + Express.js
Database
MongoDB Atlas
Authentication
JWT (JSON Web Token)-based login/signup
Hosting
Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)




4. Key Features
Category
Features
Authentication & Authorization
Secure user registration, login, logout, and role-based access control using JWT
AI Career Recommendation
Get AI-powered personalized career guidance using OpenAI API
Course Explorer
Browse curated online courses by domain, skill, or provider
Advanced Search & Filtering
Implement searching, sorting, filtering, and pagination for courses and recommendations
Resume Builder
Build and download resumes using smart templates and AI enhancement suggestions
CRUD Operations
Manage user resumes, saved careers, and preferred courses
Frontend Routing
Pages: Home, Login, Dashboard, Career Guide, Courses, Resume Builder, Profile
Hosting
Fully deployed online for accessibility


5. Tech Stack
Layer
Technologies
Frontend
React.js, React Router, TailwindCSS
Backend
Node.js, Express.js
Database
MongoDB Atlas
Authentication
JWT-based Authentication
AI Integration
OpenAI API (for personalized career guidance and resume enhancement)
Hosting
Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)






6. API Overview
Endpoint
Method
Description
Access
/api/auth/signup
POST
Register a new user
Public
/api/auth/login
POST
Login and get JWT token
Public
/api/careers/recommend
POST
Get AI-based career recommendations
Authenticated
/api/courses
GET
Fetch all courses with searching, sorting, filtering, and pagination
Authenticated
/api/resume
POST
Create or update resume
Authenticated
/api/resume/:id
DELETE
Delete user resume
Authenticated
/api/user/:id
GET
Fetch user profile and preferences
Authenticated



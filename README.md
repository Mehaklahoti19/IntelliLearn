# IntelliLearn — AI-Powered Learning Platform

A full-stack e-learning platform with AI tutoring, smart notes, quizzes, resume analysis, and personalized learning paths.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + Prisma ORM (SQLite)
- **AI**: Groq API (Llama 3.1)
- **Deployment**: Vercel (frontend) + Render (backend)

## Features

- AI Tutor chat with persistent history
- AI-generated study notes (downloadable as PDF)
- AI-generated MCQ quizzes with scoring
- Resume Analyzer — skill gap detection + course recommendations
- Mini Project Generator — AI-generated project ideas with steps
- Smart Notifications — course reminders and progress alerts
- Course video player (YouTube embed)
- Course enrollment and progress tracking
- Learning streak tracker
- Bookmark/favorite courses
- Continue Learning section
- Certificate generation on course completion
- Dark / Light mode toggle
- INR pricing (₹)
- 20+ courses across Web Dev, Data Science, AI/ML, Python, Java, UI/UX

## Getting Started

### Prerequisites
- Node.js 18+
- A [Groq API key](https://console.groq.com/keys) (free)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in GROQ_API_KEY and JWT_SECRET in .env
npm install
npm run db:migrate
npm run seed
npm run dev
```

### Frontend Setup

```bash
cd frontend
# Create .env with:
# VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

## Environment Variables

### Backend `.env`
```
PORT=5000
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
DATABASE_URL="file:./dev.db"
```

### Frontend `.env` (local)
```
VITE_API_URL=http://localhost:5000/api
```

### Vercel Environment Variable
Set in Vercel dashboard → Project Settings → Environment Variables:
```
VITE_API_URL=https://intellilearn-y9os.onrender.com/api
```

## Deployment

### Frontend → Vercel
1. Push repo to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add env var: `VITE_API_URL=https://intellilearn-y9os.onrender.com/api`
5. Deploy

### Backend → Render
1. Create a new **Web Service** on [Render](https://render.com)
2. Set **Root Directory** to `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all env vars from `.env.example` in Render dashboard

## Test Credentials (after seeding)

```
Email: test@example.com
Password: test123
```

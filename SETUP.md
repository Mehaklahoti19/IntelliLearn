# IntelliLearn - AI-Powered Learning Platform

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Run database migrations to create SQLite tables:
```bash
npx prisma migrate dev
```

4. Seed the database with sample data:
```bash
npm run seed
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Test Credentials

After running the seeder, you can use these test credentials:
- **Email:** test@example.com
- **Password:** test123

## Database

This project uses **SQLite** with **Prisma ORM** as the database. The database file (`dev.db`) is automatically created in the `backend` directory when you run migrations.

### Database Features:
- ✅ Local file-based database (no external database server required)
- ✅ Type-safe queries with Prisma Client
- ✅ Automatic migrations
- ✅ 9 models: User, Course, Enrollment, Lesson, Quiz, ChatHistory, BookmarkedCourse, CompletedQuiz, Review

### Useful Database Commands:

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Project Structure

```
IntelliLearn/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware (auth)
│   ├── models/          # Prisma schema
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── prisma/          # Prisma schema and migrations
│   ├── dev.db           # SQLite database file (auto-created)
│   └── server.js        # Express server
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── services/    # API services
    │   └── App.jsx      # Main app component
    └── index.html
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (admin)
- `PUT /api/courses/:id` - Update course (admin)
- `DELETE /api/courses/:id` - Delete course (admin)

### User
- `GET /api/user/dashboard` - Get user dashboard
- `POST /api/user/enroll` - Enroll in course
- `GET /api/user/progress` - Get learning progress

### AI
- `POST /api/ai/chat` - Chat with AI tutor
- `POST /api/ai/notes` - Generate notes
- `POST /api/ai/quiz` - Generate quiz
- `GET /api/ai/history` - Get chat history

## Technologies Used

### Backend
- Node.js + Express
- Prisma ORM
- SQLite Database
- JWT Authentication
- Google Gemini AI

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router

## Troubleshooting

### Database Issues

If you encounter database errors:

1. Delete the `dev.db` file in the backend directory
2. Delete the `prisma/migrations` folder
3. Run `npx prisma migrate dev` again
4. Run `npm run seed` to populate sample data

### Port Already in Use

If port 5000 or 5173 is already in use:
- Backend: Change `PORT` in `.env` file
- Frontend: Vite will automatically find an available port

## License

ISC

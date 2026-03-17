# IntelliLearn - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Get Your API Keys

#### MongoDB Atlas (Database)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create cluster (M0 Free tier)
4. Click Connect → Connect your application
5. Copy connection string
6. Replace `<password>` with your database password

#### Google Gemini AI
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

### Step 2: Configure Backend

```bash
cd backend
```

Edit `.env` file with your credentials:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/intellilearn
GEMINI_API_KEY=your-gemini-api-key-here
JWT_SECRET=any-random-string-at-least-32-chars
```

### Step 3: Install & Seed Database

```bash
# Install dependencies
npm install

# Seed sample courses (optional but recommended)
npm run seed
```

### Step 4: Start Backend Server

```bash
# Development mode with auto-reload
npm run dev
```

Backend runs on http://localhost:5000

### Step 5: Start Frontend

Open new terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## 🎉 You're Ready!

Visit http://localhost:5173 and explore IntelliLearn!

## 📱 What You Can Do Now

### As a Visitor:
- Browse landing page
- View all courses
- Filter and search courses
- View course details

### As a Registered User:
- Sign up for account
- Enroll in courses
- Track progress
- Use AI features:
  - Chat with AI tutor
  - Generate notes
  - Generate quizzes
  - Get course recommendations

## 🔑 Test Credentials (If you seeded the database)

Create your own account or use test data:
- Email: test@example.com
- Password: test123

(Or better yet, create your own account!)

## 💡 Pro Tips

1. **AI Features**: All AI features require authentication
2. **Course Enrollment**: Enroll in courses to track progress
3. **Dark Mode**: Toggle in navbar for different themes
4. **Responsive**: Try on mobile view (F12 → Device toolbar)

## 🐛 Common Issues

### Backend won't start
- Check MongoDB URI is correct
- Ensure port 5000 is available
- Run `npm install` again

### Frontend shows blank page
- Open browser console (F12)
- Check if backend is running
- Clear cache and reload

### AI not working
- Verify GEMINI_API_KEY is valid
- Check network tab for errors
- Ensure you're logged in

## 🆘 Need Help?

Check the main README.md for detailed documentation.

Happy Learning! 🎓✨

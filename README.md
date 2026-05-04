# 🎓 CourseConstruct:AI based Course Generator SaaS

An AI-powered learning platform that allows users to generate structured courses, track progress, and manage content through a modern dashboard. Built with a scalable architecture and real-time analytics.

## 🚀 Features

### 👤 User Features

* 🔐 Authentication with Clerk
* 📚 AI-generated courses using Groq (LLM)
* 🎥 Optional video-based learning content
* 📊 Track course progress
* ⭐ Submit feedback and ratings
* 🔄 Regenerate course content

### 🛠️ Admin Features

* 📊 Analytics dashboard (users, courses, engagement)
* 👥 User management
* 📦 Course management (publish/draft/delete)
* 💬 Feedback monitoring system
* 🔐 Role-based access (Admin only)

### ⚡ AI Features

* 🧠 Course generation via Groq API
* 🧩 Structured JSON output (chapters, topics, duration)
* 🎨 AI banner prompt generation

## 🏗️ Tech Stack

### Frontend

* Next.js 15 (App Router)
* React
* Tailwind CSS
* ShadCN UI

### Backend

* Next.js API Routes
* Drizzle ORM
* PostgreSQL

### Authentication

* Clerk (Auth + Billing)

### AI Integration

* Groq API (LLM)

### State & Data

* React Query (TanStack)
* Axios
## 📂 Project Structure

```
/app
  /workspace          → User dashboard
  /admin              → Admin panel
    /dashboard
    /users
    /courses
    /analytics
  /api
    /courses
    /admin-analytics
    /admin-reports
    /generate-course

/config
  db.js               → Database config
  schema.js           → Drizzle schema

/components
  ui/                 → Reusable UI components
```

## 🔐 Authentication & Roles

* Uses Clerk for authentication
* Admin access restricted via:

  ```
  /app/admin/layout.js
  ```
* Only authorized emails can access admin dashboard

## ⚙️ Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=your_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
GROQ_API_KEY=your_groq_key
```

## 🧠 How It Works

1. User creates a course
2. AI generates structured content
3. User can:

   * View course
   * Regenerate content
4. Admin monitors:

   * Usage
   * Engagement
   * Feedback


## 📊 Analytics

* Total users
* Total courses
* Published vs draft
* Enrollments
* Top performing courses
* Recent users


## 🧪 Installation

```bash
git clone https://github.com/your-username/your-repo.git

cd your-repo

npm install

npm run dev
```

## 🌐 Deployment

Recommended:

* Vercel (Frontend + API)
* Neon / Supabase (PostgreSQL)

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

## 📄 License

MIT License

## 💡 Author

Built by **NIDHI KUMARI**

## ⭐ Support

If you like this project:

* Star ⭐ the repo
* Share with others
* Contribute 🚀

# Smart Bookmark App

![CI](https://github.com/ekagra0012/smart-bookmark-app/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/github/license/ekagra0012/smart-bookmark-app)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

**Smart Bookmark App** is a modern, secure, and efficient application designed to help you organize and manage your bookmarks effortlessly. Built with the latest web technologies, it ensures a seamless experience across all your devices.

## 🚀 Features

- **🔐 Secure Authentication**: Robust user authentication powered by Supabase Auth (Google OAuth).
- **⚡ Real-time Synchronization**: Instant updates across all devices using Supabase Realtime.
- **🛡️ Row Level Security (RLS)**: Enterprise-grade data security ensuring users only access their own data.
- **📱 Responsive Design**: A beautiful, mobile-first interface built with Tailwind CSS.
- **✨ Modern UI**: interactive components and smooth user experience.
- **🔍 Type Safety**: Full TypeScript support for reliable and maintainable code.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/)

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/ekagra0012/smart-bookmark-app.git
    cd smart-bookmark-app
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup**
    Run the SQL scripts located in `schema.sql` in your Supabase SQL Editor to set up the tables and security policies.

5.  **Run the application**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

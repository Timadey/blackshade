# 🕶 Blackshade — Speak Freely. Stay Anonymous.

**Blackshade** is a premium, privacy-first anonymous social network designed for sharing secrets, asking questions, and connecting without revealing your identity. Built with a stunning glassmorphic aesthetic and real-time capabilities.

![Blackshade Preview](https://blackshade.site/favicon.ico)

> [!TIP]
> **Experience it now: [Visit Blackshade Live](https://blackshade.site/)** 🚀

## 🎭 Key Features

- **Anonymous Boards**: Create unique spaces for specific communities, topics, or games (Confessions, Q&A, Hot Takes).
- **Ghost Identity**: No accounts required for visitors. Every interaction generates a unique pseudonym, ensuring your secrets stay yours.
- **Premium UI/UX**: A state-of-the-art glassmorphic design system with vibrant gradients, dynamic backgrounds, and smooth micro-animations.
- **Real-time Interaction**: Watch secrets appear live with real-time message streaming, emoji reactions, and live presence tracking.
- **Privacy Controls**: 
  - **Public Boards**: Everyone can see and post.
  - **Private Boards**: Only the board owner can see incoming messages, while senders remain completely anonymous.
- **Share as Image**: Export any anonymous message into a high-quality image card ready for social media sharing.
- **SEO & PWA Ready**: Optimized with `react-helmet-async` for dynamic metadata and fully "installable" as a Progressive Web App (PWA).

## 🛠 Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Database**: [Supabase](https://supabase.com/) (Auth, PostgreSQL DB, Realtime)
- **State/SEO**: [React Helmet Async](https://github.com/staylor/react-helmet-async)
- **Utilities**: [Lucide React](https://lucide.dev/), `html-to-image`, `dicebear` avatars

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/blackshade.git
cd blackshade
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Locally
```bash
npm run dev
```

## 🔒 Security & Privacy

Blackshade uses Supabase Row Level Security (RLS) to ensure that only board owners can access private data. Anonymous authentication is used to track "Interacted Boards" without requiring personal information like emails or phone numbers.

## ✨ Ready to haunt?

Join the shadows and start your anonymous journey today.

[**Start Your Board on Blackshade**](https://blackshade.site/) 🕶


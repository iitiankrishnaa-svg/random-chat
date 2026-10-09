# StrangerSpace 🌌
A production-minded, privacy-preserving random stranger text-chat website built with **Next.js 14 (App Router)** and **Supabase (PostgreSQL with RLS & Realtime)**.

---

## 🚀 Windows & PowerShell Setup Guide

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ (tested on Node v24)
- **Git**: Installed and available in PATH
- **Supabase Account**: Free-tier account at [supabase.com](https://supabase.com)

---

### 2. Local Installation

Open **PowerShell** in the project directory:

```powershell
# 1. Install dependencies
npm install

# 2. Copy environment variable template
Copy-Item .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

---

### 3. Supabase Database Configuration

1. Create a new project in your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication -> Providers -> Anonymous Sign-in** and enable it.
3. Go to **Database -> SQL Editor** and paste the entire content of:
   `supabase/migrations/20261009000000_initial_schema.sql`
4. Click **Run** to execute the migration. This creates:
   - Tables: `profiles`, `policy_acceptances`, `match_queue`, `chat_sessions`, `blocks`, `reports`, `messages`, `user_restrictions`, `admins`
   - Row Level Security (RLS) policies
   - Transactional matchmaking RPC functions (`find_match`, `check_queue_status`, `send_message`, etc.)
   - Realtime publication on `chat_sessions` and `messages`

---

### 4. Running the Website Locally

```powershell
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 5. Running Automated Tests

```powershell
npm test
```

---

### 6. Designating an Administrator

To grant admin access to the `/admin` moderation dashboard:
1. Open your browser and navigate to `http://localhost:3000/chat`.
2. Inspect your browser console or check Supabase **Authentication -> Users** to find your anonymous user UUID.
3. In Supabase SQL Editor, run:
```sql
INSERT INTO public.admins (user_id) VALUES ('YOUR-USER-UUID');
```
4. Visit `http://localhost:3000/admin`. You now have access to inspect and action reports.

---

### 7. Emergency Incident Shutdown

To disable new matches instantly during an incident without taking down the website, run this in Supabase SQL editor:
```sql
UPDATE public.match_queue SET status = 'cancelled' WHERE status = 'waiting';
```

---

### 8. Production Deployment (Vercel)

1. Push your repository to GitHub:
```powershell
git add .
git commit -m "Initial StrangerSpace release"
git push origin main
```
2. Import project in [Vercel](https://vercel.com).
3. Set Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

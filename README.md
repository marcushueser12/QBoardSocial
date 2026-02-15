# QBoard Social

Answer the daily question. See others after you answer.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) on Vercel
- **Backend API**: Node.js + Hono on Railway
- **Database/Auth**: Supabase (PostgreSQL, Auth, Storage)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations:
   ```bash
   supabase db push
   ```
   Or apply the SQL files in `supabase/migrations/` manually.
3. Run seed (optional):
   ```bash
   psql $DATABASE_URL -f supabase/seed.sql
   ```
4. Get your project URL and anon key from Settings > API.

### 2. Web App (Vercel)

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp apps/web/.env.example .env.local
   ```
2. Set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

### 3. API (Railway)

1. Deploy `packages/api` to Railway
2. Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` (or `SUPABASE_SERVICE_ROLE_KEY` for cron)
   - `CRON_SECRET` (for `/cron/daily-question` endpoint)
3. Configure a cron job to call `POST /cron/daily-question` daily with `Authorization: Bearer $CRON_SECRET`

### 4. Make a user admin

To access the admin dashboard and create questions:

```sql
UPDATE profiles SET is_admin = true WHERE id = 'your-user-uuid';
```

## Project Structure

```
├── apps/web/          # Next.js frontend
├── packages/api/      # Railway API (Hono)
├── supabase/
│   ├── migrations/    # DB schema and RLS
│   └── seed.sql       # Initial data
```

## Features

- **User System**: Sign up, profiles, onboarding
- **Daily Questions**: Global + community questions
- **Answer Gating**: Must answer before seeing others (enforced by RLS)
- **Boards**: Global, Personal, Community
- **Communities**: Create, join, daily questions
- **Reactions**: Like answers
- **Reports**: Report answers/users/communities
- **Admin**: Create questions, moderate reports
- **Account**: Data export, deletion

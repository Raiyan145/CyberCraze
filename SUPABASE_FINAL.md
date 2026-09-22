# Supabase final setup

## 1. Create project
Create a Supabase project.

## 2. Run database SQL
SQL Editor → paste and run `supabase-final.sql`.

## 3. Create admin
Authentication → Users → Add user:
- Email: `admin@cybercraze.local`
- Password: your private password

Then run:
```sql
insert into public.admin_profiles(id,username)
select id,'admin' from auth.users where email='admin@cybercraze.local';
```

## 4. Configure website
Open `assets/supabase-config.js`:
```js
window.CC_SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
window.CC_SUPABASE_ANON_KEY = "YOUR_PUBLISHABLE_OR_ANON_KEY";
```

Use only the publishable/anon key. NEVER use `service_role`.

## 5. GitHub + Vercel
Commit the files, import the repository into Vercel, and deploy.

## Important
The booking RPC checks:
- only today / next 2 days
- 10 AM–10 PM
- whole hours
- 1 or 2 players
- correct price
- overlapping booking prevention

The customer can submit without an account. Admin dashboard requires Supabase authentication.

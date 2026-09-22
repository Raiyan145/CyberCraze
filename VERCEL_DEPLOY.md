# Vercel deployment

1. Push this folder to your existing GitHub repository.
2. Vercel → Add New Project → Import your GitHub repository.
3. Framework preset: Other.
4. Build command: leave empty.
5. Output directory: `.`.
6. Deploy.
7. Before deploying, edit `assets/supabase-config.js` with your Supabase Project URL + publishable/anon key.
8. Add your Vercel domain to Supabase Authentication → URL Configuration → Site URL / Redirect URLs if you later use hosted auth flows.

No service_role key should ever be committed to GitHub.

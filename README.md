# CyberCraze Booking Website

A dark, responsive prototype for CyberCraze Gaming Space.

## Pages
- `index.html` — customer landing page + today's availability
- `booking.html` — customer booking flow
- `admin.html` — owner/admin dashboard

## Pricing
- 1 player: ৳100/hour
- 2 players on one PS4 (2 controllers): ৳150/hour total
- Full-hour sessions only
- Booking window: today + next 2 days
- Opening hours: 10 AM–10 PM

## Current prototype behavior
Bookings are stored in the browser's `localStorage`, so this ZIP works immediately as a front-end demo.

## Important for production
For multiple customers/devices to share the same live availability, connect the booking form and admin dashboard to a real backend such as Supabase. Add authentication for the admin page and server-side constraints to prevent double booking.

## Run
You can open `index.html` directly for the demo, or deploy the folder to Vercel/GitHub Pages.

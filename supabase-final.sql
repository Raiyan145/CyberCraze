-- CYBERCRAZE FINAL DATABASE
create extension if not exists pgcrypto;

create table if not exists public.admin_profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 username text unique not null,
 created_at timestamptz not null default now()
);
alter table public.admin_profiles enable row level security;

create table if not exists public.bookings(
 id uuid primary key default gen_random_uuid(),
 booking_code text unique not null,
 customer_name text not null check(length(trim(customer_name)) between 1 and 80),
 customer_phone text not null check(length(trim(customer_phone)) between 5 and 20),
 booking_date date not null,
 start_hour integer not null check(start_hour between 10 and 21),
 duration integer not null check(duration between 1 and 12),
 players integer not null check(players in(1,2)),
 amount integer not null check(amount in (duration*100,duration*150)),
 status text not null default 'confirmed' check(status in('confirmed','cancelled')),
 created_at timestamptz not null default now()
);
alter table public.bookings enable row level security;

-- Customers do NOT receive direct table insert permission.
-- They call the secure RPC below.
create or replace function public.create_booking(
 p_booking_code text,p_customer_name text,p_customer_phone text,
 p_booking_date date,p_start_hour integer,p_duration integer,
 p_players integer,p_amount integer
) returns public.bookings
language plpgsql security definer set search_path=public
as $$
declare v public.bookings;
begin
 if p_booking_date < current_date or p_booking_date > current_date + 2 then
   raise exception 'Bookings are available only for today and the next 2 days';
 end if;
 if p_start_hour < 10 or p_start_hour > 21 then raise exception 'Invalid start time'; end if;
 if p_duration < 1 or p_duration > (22-p_start_hour) then raise exception 'Invalid duration'; end if;
 if p_players not in (1,2) then raise exception 'Invalid player count'; end if;
 if p_amount <> p_duration * case when p_players=1 then 100 else 150 end then raise exception 'Invalid amount'; end if;
 if exists(
   select 1 from public.bookings b
   where b.booking_date=p_booking_date and b.status='confirmed'
   and b.start_hour < p_start_hour+p_duration
   and b.start_hour+b.duration > p_start_hour
 ) then raise exception 'Selected time is already booked'; end if;

 insert into public.bookings(booking_code,customer_name,customer_phone,booking_date,start_hour,duration,players,amount)
 values(p_booking_code,trim(p_customer_name),trim(p_customer_phone),p_booking_date,p_start_hour,p_duration,p_players,p_amount)
 returning * into v;
 return v;
end $$;

revoke all on function public.create_booking(text,text,text,date,integer,integer,integer,integer) from public;
grant execute on function public.create_booking(text,text,text,date,integer,integer,integer,integer) to anon,authenticated;

-- Admins can read bookings only when authenticated.
create policy "Authenticated admins read bookings"
on public.bookings for select to authenticated using (
 exists(select 1 from public.admin_profiles a where a.id=auth.uid())
);

create policy "Admins read own profile"
on public.admin_profiles for select to authenticated using (id=auth.uid());

-- After creating auth user admin@cybercraze.local:
-- insert into public.admin_profiles(id,username)
-- select id,'admin' from auth.users where email='admin@cybercraze.local';

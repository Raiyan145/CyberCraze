/* =========================================================
   CYBERCRAZE — HOME PAGE APP
   ========================================================= */

const SUPABASE_URL = window.CC_SUPABASE_URL || "";
const SUPABASE_KEY = window.CC_SUPABASE_ANON_KEY || "";

const slotGrid = document.getElementById("slotGrid");
const nextSlot = document.getElementById("nextSlot");

const OPEN_HOUR = 10;
const CLOSE_HOUR = 22;

/* ---------- Date helpers ---------- */

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function formatTime(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${suffix}`;
}

/* ---------- Render slots ---------- */

function renderSlots(bookedHours = []) {

  if (!slotGrid) return;

  slotGrid.innerHTML = "";

  for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour++) {

    const booked = bookedHours.includes(hour);

    const slot = document.createElement("div");

    slot.className = `slot ${booked ? "booked" : "open"}`;

    slot.innerHTML = `
      <strong>${formatTime(hour)}</strong>
      <small>
        ${booked ? "Booked" : "Available"}
      </small>
    `;

    slotGrid.appendChild(slot);
  }

  updateNextAvailable(bookedHours);
}

/* ---------- Next available ---------- */

function updateNextAvailable(bookedHours = []) {

  if (!nextSlot) return;

  const now = new Date();

  let startHour = OPEN_HOUR;

  /*
    If today's time is already past 10 AM,
    don't show an earlier slot.
  */
  if (now.getHours() >= OPEN_HOUR) {
    startHour = Math.max(
      OPEN_HOUR,
      now.getMinutes() > 0
        ? now.getHours() + 1
        : now.getHours()
    );
  }

  for (let hour = startHour; hour < CLOSE_HOUR; hour++) {

    if (!bookedHours.includes(hour)) {
      nextSlot.textContent = formatTime(hour);
      return;
    }
  }

  nextSlot.textContent = "No slots today";
}

/* ---------- Supabase ---------- */

async function getBookingsFromSupabase() {

  if (
    !SUPABASE_URL ||
    !SUPABASE_KEY ||
    SUPABASE_URL.startsWith("YOUR_") ||
    SUPABASE_KEY.startsWith("YOUR_")
  ) {
    return [];
  }

  const date = todayISO();

  const url =
    `${SUPABASE_URL}/rest/v1/bookings` +
    `?booking_date=eq.${date}` +
    `&status=eq.confirmed` +
    `&select=start_hour,duration`;

  try {

    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      console.warn("Supabase availability request failed.");
      return [];
    }

    const bookings = await response.json();

    const bookedHours = [];

    bookings.forEach(booking => {

      const start = Number(booking.start_hour);
      const duration = Number(booking.duration);

      for (
        let hour = start;
        hour < start + duration;
        hour++
      ) {
        bookedHours.push(hour);
      }

    });

    return [...new Set(bookedHours)];

  } catch (error) {

    console.warn(
      "Could not connect to Supabase:",
      error
    );

    return [];
  }
}

/* ---------- Initial load ---------- */

async function loadAvailability() {

  /*
    Show the slots immediately so the page
    doesn't look empty while loading.
  */
  renderSlots([]);

  const bookedHours =
    await getBookingsFromSupabase();

  renderSlots(bookedHours);
}

/* ---------- Auto refresh ---------- */

/*
  Refresh availability every 30 seconds.
*/
setInterval(() => {
  loadAvailability();
}, 30000);

/* ---------- Start ---------- */

loadAvailability();

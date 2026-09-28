/* =========================================================
   CYBERCRAZE — BOOKING SYSTEM + LIVE AVAILABILITY
   ========================================================= */

const OPEN_HOUR = 10;
const CLOSE_HOUR = 22;
const MAX_DAYS_AHEAD = 2;

const PRICE_ONE_PLAYER = 100;
const PRICE_TWO_PLAYERS = 150;


/* =========================================================
   ELEMENTS
   ========================================================= */

const dateChoices =
  document.getElementById("dateChoices");

const timeChoices =
  document.getElementById("timeChoices");

const durationChoices =
  document.getElementById("durationChoices");

const playerButtons =
  document.querySelectorAll(".player-card");

const summarySession =
  document.getElementById("summarySession");

const summaryPlayers =
  document.getElementById("summaryPlayers");

const totalPrice =
  document.getElementById("totalPrice");

const bookingForm =
  document.getElementById("bookingForm");

const formError =
  document.getElementById("formError");

const confirmBtn =
  document.getElementById("confirmBtn");

const successModal =
  document.getElementById("successModal");

const successText =
  document.getElementById("successText");

const continueBtn =
  document.getElementById("continueBtn");


/* =========================================================
   STATE
   ========================================================= */

let selectedDate = null;
let selectedHour = null;
let selectedDuration = 1;
let selectedPlayers = 1;

let bookedHours = [];


/* =========================================================
   DATE HELPERS
   ========================================================= */

function localDateString(date) {

  const year = date.getFullYear();

  const month =
    String(date.getMonth() + 1).padStart(2, "0");

  const day =
    String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function getAvailableDates() {

  const dates = [];

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  for (
    let i = 0;
    i <= MAX_DAYS_AHEAD;
    i++
  ) {

    const date = new Date(today);

    date.setDate(
      today.getDate() + i
    );

    dates.push(date);
  }

  return dates;
}


function formatDate(date) {

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric"
    }
  );

}


function formatTime(hour) {

  const suffix =
    hour >= 12 ? "PM" : "AM";

  const h =
    hour % 12 || 12;

  return `${h}:00 ${suffix}`;
}


/* =========================================================
   GET BOOKED HOURS FROM SUPABASE
   ========================================================= */

async function loadBookedHours() {

  bookedHours = [];

  if (
    !window.CC_SUPABASE_URL ||
    !window.CC_SUPABASE_ANON_KEY
  ) {

    console.warn(
      "Supabase configuration missing."
    );

    return;

  }


  if (!selectedDate) return;


  try {

    const response =
      await fetch(
        `${window.CC_SUPABASE_URL}/rest/v1/rpc/get_booked_hours`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            apikey:
              window.CC_SUPABASE_ANON_KEY,

            Authorization:
              `Bearer ${window.CC_SUPABASE_ANON_KEY}`
          },

          body: JSON.stringify({
            p_booking_date:
              selectedDate
          })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      console.error(
        "Availability error:",
        data
      );

      return;

    }


    /*
      Convert bookings into individual
      blocked hours.

      Example:

      start = 10
      duration = 3

      Blocks:

      10
      11
      12
    */

    const hours = [];


    data.forEach(booking => {

      const start =
        Number(booking.start_hour);

      const duration =
        Number(booking.duration);


      for (
        let hour = start;
        hour < start + duration;
        hour++
      ) {

        hours.push(hour);

      }

    });


    bookedHours =
      [...new Set(hours)];

  } catch (error) {

    console.error(
      "Could not load availability:",
      error
    );

  }

}


/* =========================================================
   DATE BUTTONS
   ========================================================= */

function renderDates() {

  dateChoices.innerHTML = "";

  const dates =
    getAvailableDates();


  dates.forEach((date, index) => {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "choice";

    button.dataset.date =
      localDateString(date);


    button.innerHTML = `
      <strong>
        ${
          index === 0
            ? "Today"
            : formatDate(date)
        }
      </strong>
    `;


    if (index === 0) {

      button.classList.add(
        "active"
      );

      selectedDate =
        localDateString(date);

    }


    button.addEventListener(
      "click",
      async () => {

        document
          .querySelectorAll(
            "#dateChoices .choice"
          )
          .forEach(btn =>
            btn.classList.remove(
              "active"
            )
          );


        button.classList.add(
          "active"
        );


        selectedDate =
          button.dataset.date;


        selectedHour = null;

        selectedDuration = 1;


        timeChoices.innerHTML = `
          <span style="
            color:#8d96a3;
            font-size:12px;
          ">
            Checking availability...
          </span>
        `;


        await loadBookedHours();


        renderTimes();

        renderDurations();

        updateSummary();

      }
    );


    dateChoices.appendChild(
      button
    );

  });

}


/* =========================================================
   CHECK WHETHER A TIME IS BOOKED
   ========================================================= */

function isHourBooked(hour) {

  return bookedHours.includes(
    hour
  );

}


/* =========================================================
   CHECK WHETHER DURATION IS AVAILABLE
   ========================================================= */

function isDurationAvailable(
  startHour,
  duration
) {

  for (
    let hour = startHour;
    hour < startHour + duration;
    hour++
  ) {

    if (
      isHourBooked(hour)
    ) {

      return false;

    }

  }


  return true;

}


/* =========================================================
   TIME BUTTONS
   ========================================================= */

function renderTimes() {

  timeChoices.innerHTML = "";

  const today =
    localDateString(
      new Date()
    );

  const now =
    new Date();


  for (
    let hour = OPEN_HOUR;
    hour < CLOSE_HOUR;
    hour++
  ) {

    const button =
      document.createElement(
        "button"
      );


    button.type = "button";

    button.className =
      "time";

    button.dataset.hour =
      hour;


    button.textContent =
      formatTime(hour);


    let unavailable = false;


    /*
      Past hours today
    */

    if (
      selectedDate === today &&
      hour <= now.getHours()
    ) {

      unavailable = true;

    }


    /*
      Already booked
    */

    if (
      isHourBooked(hour)
    ) {

      unavailable = true;

    }


    if (unavailable) {

      button.disabled = true;

      button.classList.add(
        "disabled"
      );

      button.setAttribute(
        "aria-label",
        `${formatTime(hour)} unavailable`
      );

    }


    if (!unavailable) {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              "#timeChoices .time"
            )
            .forEach(btn =>
              btn.classList.remove(
                "active"
              )
            );


          button.classList.add(
            "active"
          );


          selectedHour =
            Number(
              button.dataset.hour
            );


          selectedDuration = 1;


          renderDurations();

          updateSummary();

        }
      );

    }


    timeChoices.appendChild(
      button
    );

  }

}


/* =========================================================
   DURATION
   ========================================================= */

function renderDurations() {

  durationChoices.innerHTML = "";


  if (
    selectedHour === null
  ) {

    durationChoices.innerHTML = `
      <span style="
        color:#8d96a3;
        font-size:12px;
      ">
        Select a start time first.
      </span>
    `;

    return;

  }


  const maxDuration =
    CLOSE_HOUR -
    selectedHour;


  for (
    let duration = 1;
    duration <= maxDuration;
    duration++
  ) {

    const button =
      document.createElement(
        "button"
      );


    button.type = "button";

    button.className =
      "choice";


    button.dataset.duration =
      duration;


    button.textContent =
      `${duration} ${
        duration === 1
          ? "hour"
          : "hours"
      }`;


    const available =
      isDurationAvailable(
        selectedHour,
        duration
      );


    if (!available) {

      button.disabled = true;

      button.classList.add(
        "disabled"
      );

    }


    if (
      duration === selectedDuration &&
      available
    ) {

      button.classList.add(
        "active"
      );

    }


    if (available) {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              "#durationChoices .choice"
            )
            .forEach(btn =>
              btn.classList.remove(
                "active"
              )
            );


          button.classList.add(
            "active"
          );


          selectedDuration =
            duration;


          updateSummary();

        }
      );

    }


    durationChoices.appendChild(
      button
    );

  }


  /*
    If current duration became unavailable,
    automatically select 1 hour.
  */

  if (
    !isDurationAvailable(
      selectedHour,
      selectedDuration
    )
  ) {

    selectedDuration = 1;

  }

}


/* =========================================================
   PLAYER SELECTION
   ========================================================= */

playerButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        playerButtons.forEach(
          btn =>
            btn.classList.remove(
              "active"
            )
        );


        button.classList.add(
          "active"
        );


        selectedPlayers =
          Number(
            button.dataset.players
          );


        updateSummary();

      }
    );

  }
);


/* =========================================================
   PRICE
   ========================================================= */

function getHourlyPrice() {

  return selectedPlayers === 2
    ? PRICE_TWO_PLAYERS
    : PRICE_ONE_PLAYER;

}


function getTotalPrice() {

  return (
    getHourlyPrice() *
    selectedDuration
  );

}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary() {

  if (summarySession) {

    if (
      selectedDate &&
      selectedHour !== null
    ) {

      summarySession.textContent =
        `${selectedDate} · ${formatTime(selectedHour)}`;

    } else {

      summarySession.textContent =
        "—";

    }

  }


  if (summaryPlayers) {

    summaryPlayers.textContent =
      selectedPlayers === 1
        ? "1 player"
        : "2 players";

  }


  if (totalPrice) {

    totalPrice.textContent =
      `৳${getTotalPrice()}`;

  }

}


/* =========================================================
   BOOKING CODE
   ========================================================= */

function generateBookingCode() {

  const random =
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();


  return `CC-${Date.now()
    .toString()
    .slice(-6)}-${random}`;

}


/* =========================================================
   VALIDATION
   ========================================================= */

function validateBooking() {

  const name =
    document
      .getElementById(
        "customerName"
      )
      .value
      .trim();


  const phone =
    document
      .getElementById(
        "customerPhone"
      )
      .value
      .trim();


  if (!selectedDate) {

    return "Please select a date.";

  }


  if (
    selectedHour === null
  ) {

    return "Please select a start time.";

  }


  if (
    !isDurationAvailable(
      selectedHour,
      selectedDuration
    )
  ) {

    return "This session is no longer available. Please choose another time.";

  }


  if (!name) {

    return "Please enter your name.";

  }


  if (!phone) {

    return "Please enter your mobile number.";

  }


  const cleanPhone =
    phone.replace(
      /[\s-]/g,
      ""
    );


  const validPhone =
    /^(01[3-9]\d{8}|\+8801[3-9]\d{8})$/
      .test(cleanPhone);


  if (!validPhone) {

    return "Please enter a valid Bangladesh mobile number.";

  }


  return null;

}


/* =========================================================
   CREATE REAL BOOKING
   ========================================================= */

async function createBooking() {

  const name =
    document
      .getElementById(
        "customerName"
      )
      .value
      .trim();


  const phone =
    document
      .getElementById(
        "customerPhone"
      )
      .value
      .trim();


  const amount =
    getTotalPrice();


  const bookingCode =
    generateBookingCode();


  const response =
    await fetch(
      `${window.CC_SUPABASE_URL}/rest/v1/rpc/create_booking`,
      {
        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          apikey:
            window.CC_SUPABASE_ANON_KEY,

          Authorization:
            `Bearer ${window.CC_SUPABASE_ANON_KEY}`

        },

        body: JSON.stringify({

          p_booking_code:
            bookingCode,

          p_customer_name:
            name,

          p_customer_phone:
            phone,

          p_booking_date:
            selectedDate,

          p_start_hour:
            selectedHour,

          p_duration:
            selectedDuration,

          p_players:
            selectedPlayers,

          p_amount:
            amount

        })

      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    /*
      Convert database error into
      a customer-friendly message.
    */

    const rawMessage =
      data?.message ||
      data?.hint ||
      "";


    if (
      rawMessage
        .toLowerCase()
        .includes("already booked")
    ) {

      throw new Error(
        "Sorry, this time was just booked by someone else. Please choose another slot."
      );

    }


    throw new Error(
      rawMessage ||
      "Booking could not be completed."
    );

  }


  return {
    booking:
      Array.isArray(data)
        ? data[0]
        : data
  };

}


/* =========================================================
   FORM SUBMIT
   ========================================================= */

bookingForm?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    formError.textContent = "";


    const validationError =
      validateBooking();


    if (validationError) {

      formError.textContent =
        validationError;

      return;

    }


    confirmBtn.disabled = true;

    confirmBtn.textContent =
      "Confirming booking...";


    try {

      const result =
        await createBooking();


      const booking =
        result.booking;


      /*
        Add newly booked hours
        immediately to local state.
      */

      for (
        let hour =
          Number(
            booking.start_hour
          );

        hour <
          Number(
            booking.start_hour
          ) +
          Number(
            booking.duration
          );

        hour++
      ) {

        bookedHours.push(
          hour
        );

      }


      bookedHours =
        [...new Set(bookedHours)];


      successText.innerHTML = `
        <strong>
          ${booking.booking_code}
        </strong>

        <br><br>

        ${booking.booking_date}

        <br>

        ${formatTime(
          Number(
            booking.start_hour
          )
        )}

        ·

        ${booking.duration}
        ${
          Number(
            booking.duration
          ) === 1
            ? "hour"
            : "hours"
        }

        <br>

        ${
          Number(
            booking.players
          ) === 1
            ? "1 player"
            : "2 players"
        }

        <br><br>

        Total:

        <strong>
          ৳${booking.amount}
        </strong>
      `;


      successModal.classList.remove(
        "hidden"
      );


      /*
        Refresh the visible slots.
      */

      renderTimes();

      renderDurations();


    } catch (error) {

      console.error(
        "CyberCraze booking error:",
        error
      );


      formError.textContent =
        error.message ||
        "Something went wrong. Please try again.";


      /*
        Reload availability because
        another customer may have booked
        the slot meanwhile.
      */

      await loadBookedHours();

      renderTimes();

      renderDurations();

    } finally {

      confirmBtn.disabled = false;

      confirmBtn.textContent =
        "Continue Booking →";

    }

  }
);


/* =========================================================
   SUCCESS MODAL
   ========================================================= */

continueBtn?.addEventListener(
  "click",
  () => {

    successModal.classList.add(
      "hidden"
    );


    bookingForm.reset();


    selectedHour = null;

    selectedDuration = 1;

    selectedPlayers = 1;


    playerButtons.forEach(
      btn =>
        btn.classList.remove(
          "active"
        )
    );


    playerButtons[0]?.classList.add(
      "active"
    );


    renderDates();

    loadBookedHours()
      .then(() => {

        renderTimes();

        renderDurations();

        updateSummary();

      });

  }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initializeBookingPage() {

  renderDates();

  await loadBookedHours();

  renderTimes();

  renderDurations();

  updateSummary();

}


initializeBookingPage();


/* =========================================================
   AUTO REFRESH AVAILABILITY
   ========================================================= */

setInterval(
  async () => {

    if (!selectedDate) return;


    await loadBookedHours();

    renderTimes();

    renderDurations();

  },
  30000
);

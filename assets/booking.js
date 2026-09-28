/* =========================================================
   CYBERCRAZE — BOOKING PAGE
   ========================================================= */

const OPEN_HOUR = 10;
const CLOSE_HOUR = 22;
const MAX_DAYS_AHEAD = 2;

const PRICE_ONE_PLAYER = 100;
const PRICE_TWO_PLAYERS = 150;

let selectedDate = null;
let selectedHour = null;
let selectedDuration = 1;
let selectedPlayers = 1;

let bookedSlots = [];


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

  const options = {
    weekday: "short",
    month: "short",
    day: "numeric"
  };

  return date.toLocaleDateString(
    "en-US",
    options
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
   DATE BUTTONS
   ========================================================= */

function renderDates() {

  if (!dateChoices) return;

  dateChoices.innerHTML = "";

  const dates =
    getAvailableDates();

  dates.forEach((date, index) => {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "choice";

    if (index === 0) {

      button.classList.add("active");

      selectedDate =
        localDateString(date);
    }

    button.dataset.date =
      localDateString(date);

    button.innerHTML = `
      <strong>
        ${index === 0 ? "Today" : formatDate(date)}
      </strong>
    `;

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll("#dateChoices .choice")
          .forEach(btn =>
            btn.classList.remove("active")
          );

        button.classList.add("active");

        selectedDate =
          button.dataset.date;

        selectedHour = null;

        renderTimes();

        updateSummary();

      }
    );

    dateChoices.appendChild(button);

  });

}


/* =========================================================
   TIME BUTTONS
   ========================================================= */

function renderTimes() {

  if (!timeChoices) return;

  timeChoices.innerHTML = "";

  for (
    let hour = OPEN_HOUR;
    hour < CLOSE_HOUR;
    hour++
  ) {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className = "time";

    button.dataset.hour = hour;

    button.textContent =
      formatTime(hour);

    /*
      If today and the time has already passed,
      disable that slot.
    */

    const today =
      localDateString(new Date());

    const now =
      new Date();

    if (
      selectedDate === today &&
      hour <= now.getHours()
    ) {

      button.disabled = true;

      button.classList.add("disabled");

    }


    /*
      Don't allow a session that would
      finish after 10 PM.
    */

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll("#timeChoices .time")
          .forEach(btn =>
            btn.classList.remove("active")
          );

        button.classList.add("active");

        selectedHour =
          Number(button.dataset.hour);

        renderDurations();

        updateSummary();

      }
    );

    timeChoices.appendChild(button);

  }

}


/* =========================================================
   DURATION
   ========================================================= */

function renderDurations() {

  if (!durationChoices) return;

  durationChoices.innerHTML = "";

  if (selectedHour === null) {

    durationChoices.innerHTML = `
      <span style="color:#8d96a3;font-size:12px">
        Select a start time first.
      </span>
    `;

    return;
  }


  /*
    Example:

    Start 10 AM
    Maximum duration = 12 hours

    Start 8 PM
    Maximum duration = 2 hours
  */

  const maxDuration =
    CLOSE_HOUR - selectedHour;


  for (
    let duration = 1;
    duration <= maxDuration;
    duration++
  ) {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className = "choice";

    button.dataset.duration =
      duration;

    button.textContent =
      `${duration} ${duration === 1 ? "hour" : "hours"}`;


    if (
      duration === selectedDuration
    ) {

      button.classList.add("active");

    }


    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            "#durationChoices .choice"
          )
          .forEach(btn =>
            btn.classList.remove("active")
          );

        button.classList.add("active");

        selectedDuration =
          Number(button.dataset.duration);

        updateSummary();

      }
    );

    durationChoices.appendChild(button);

  }

}


/* =========================================================
   PLAYERS
   ========================================================= */

playerButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      playerButtons.forEach(btn =>
        btn.classList.remove("active")
      );

      button.classList.add("active");

      selectedPlayers =
        Number(button.dataset.players);

      updateSummary();

    }
  );

});


/* =========================================================
   PRICE
   ========================================================= */

function getHourlyPrice() {

  if (selectedPlayers === 2) {

    return PRICE_TWO_PLAYERS;

  }

  return PRICE_ONE_PLAYER;

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
   VALIDATION
   ========================================================= */

function validateBooking() {

  const name =
    document.getElementById(
      "customerName"
    ).value.trim();

  const phone =
    document.getElementById(
      "customerPhone"
    ).value.trim();


  if (!selectedDate) {

    return "Please select a date.";

  }


  if (selectedHour === null) {

    return "Please select a start time.";

  }


  if (!selectedDuration) {

    return "Please select your duration.";

  }


  if (!name) {

    return "Please enter your name.";

  }


  if (!phone) {

    return "Please enter your mobile number.";

  }


  /*
    Bangladesh mobile number validation.
    Accepts:

    01XXXXXXXXX
    +8801XXXXXXXXX
  */

  const cleanPhone =
    phone.replace(/[\s-]/g, "");

  const validPhone =
    /^(01[3-9]\d{8}|\+8801[3-9]\d{8})$/
      .test(cleanPhone);


  if (!validPhone) {

    return "Please enter a valid Bangladesh mobile number.";

  }


  return null;

}


/* =========================================================
   FORM SUBMIT
   ========================================================= */

bookingForm?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    formError.textContent = "";


    const error =
      validateBooking();


    if (error) {

      formError.textContent =
        error;

      return;

    }


    confirmBtn.disabled = true;

    confirmBtn.textContent =
      "Checking availability...";


    /*
      Database booking will be connected
      in the next step.

      For now we prepare the booking
      information locally.
    */

    const booking = {

      name:
        document
          .getElementById("customerName")
          .value
          .trim(),

      phone:
        document
          .getElementById("customerPhone")
          .value
          .trim(),

      date:
        selectedDate,

      startHour:
        selectedHour,

      duration:
        selectedDuration,

      players:
        selectedPlayers,

      hourlyPrice:
        getHourlyPrice(),

      total:
        getTotalPrice()

    };


    console.log(
      "CyberCraze booking:",
      booking
    );


    /*
      Temporary success message.

      This will be replaced with the
      Supabase booking request next.
    */

    setTimeout(() => {

      successText.textContent =
        `${booking.name}, your ${booking.duration}-hour session on ${booking.date} at ${formatTime(booking.startHour)} has been prepared.`;

      successModal.classList.remove(
        "hidden"
      );

      confirmBtn.disabled = false;

      confirmBtn.textContent =
        "Continue Booking →";

    }, 500);

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

  }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

renderDates();

renderTimes();

renderDurations();

updateSummary();

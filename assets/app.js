const bookings=()=>JSON.parse(localStorage.getItem('cc_bookings')||'[]');
const hours=Array.from({length:12},(_,i)=>10+i);
const fmt=h=>{const ap=h>=12?'PM':'AM';const n=h%12||12;return `${n}:00 ${ap}`};
function todayISO(){const d=new Date();return d.toISOString().slice(0,10)}
function slotBooked(date,h){return bookings().some(b=>b.date===date&&Array.from({length:b.duration},(_,i)=>b.start+i).includes(h))}
const grid=document.getElementById('slotGrid');
if(grid){const date=todayISO();hours.forEach(h=>{const el=document.createElement('div');const booked=slotBooked(date,h);el.className='slot '+(booked?'booked':'available');el.innerHTML=`<span class="slot-badge">${booked?'Booked':'Available'}</span><strong>${fmt(h)}</strong><small>${booked?'Session reserved':'Open for booking'}</small>`;grid.appendChild(el)});const next=hours.find(h=>!slotBooked(date,h));document.getElementById('nextSlot').textContent=next?fmt(next):'Fully booked'}
}
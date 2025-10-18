// fullcalendar-init.js
// Parse existing .schedule-card elements and initialize FullCalendar month view for Apr-Oct 2025
(function(){
  function qAll(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }
    function parseTripDate(str){
    if(!str) return null;
    var parts = str.split('-').map(s=>s.trim());
    if(parts.length !== 2) return null;
    function toLocalISO(part){
      var m = part.match(/(\d{1,2})\/(\d{1,2})/);
      if(!m) return null;
      var d = parseInt(m[1],10), mo = parseInt(m[2],10);
      var dt = new Date(2025, mo-1, d);
      var pad = function(n){ return n < 10 ? '0'+n : String(n); };
      return dt.getFullYear() + '-' + pad(dt.getMonth()+1) + '-' + pad(dt.getDate());
    }
    var s = toLocalISO(parts[0]);
    var e = toLocalISO(parts[1]);
    if(!s || !e) return null;
    return {start:s, end:e};
  }

  function gather(){
    var events = [];
    qAll('.schedule-card').forEach(card=>{
      var timeEl = card.querySelector('.trip-date');
      var rd = timeEl ? timeEl.textContent.trim() : '';
      var parsed = parseTripDate(rd);
      if(!parsed) return;
      var route = (card.querySelector('.route')||{textContent:''}).textContent.trim();
      var sold = !!card.querySelector('.availability.sold-out');
      events.push({title: route || 'Rejs', start: parsed.start, end: parsed.end, allDay: true, backgroundColor: sold ? '#ef4444' : '#0ea5e9', borderColor: sold ? '#ef4444' : '#0ea5e9'});
    });
    return events;
  }

  document.addEventListener('DOMContentLoaded', function(){
    var root = document.getElementById('calendar-root');
    if(!root) return;
    // FullCalendar expects end-exclusive dates for allDay events; our parsed end is inclusive -> add one day
    var raw = gather();
    raw = raw.map(function(ev){
      var endStr = ev.end;
      var m = String(endStr).match(/(\d{4})-(\d{2})-(\d{2})/);
      if(m){
        var y = parseInt(m[1],10), mo = parseInt(m[2],10), d = parseInt(m[3],10);
        var endExclDate = new Date(y, mo-1, d+1);
        var pad = function(n){ return n < 10 ? '0'+n : String(n); };
        var endExcl = endExclDate.getFullYear() + '-' + pad(endExclDate.getMonth()+1) + '-' + pad(endExclDate.getDate());
        return Object.assign({}, ev, { end: endExcl });
      }
      return ev;
    });

    try{
      if(typeof FullCalendar === 'undefined' || !FullCalendar.Calendar) throw new Error('FullCalendar not loaded');
      var calendar = new FullCalendar.Calendar(root, {
        initialView: 'dayGridMonth',
        locale: 'pl',
        // Explicit day header labels in Polish (short) to ensure visibility
        dayHeaderContent: function(arg){
          var pl = ['Nd','Pn','Wt','Śr','Cz','Pt','So'];
          // FullCalendar's week starts with Sunday in some configs; align with firstDay
          var idx = arg.date.getDay(); // 0 = Sunday
          return { html: pl[idx] };
        },
        dayHeaderFormat: { weekday: 'short' },
        headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
        firstDay: 1, // Monday
        initialDate: '2025-04-01',
        validRange: { start: '2025-04-01', end: '2025-11-01' }, // FullCalendar end is exclusive
        events: raw,
        dayMaxEventRows: true,
        height: 'auto',
        fixedWeekCount: false
      });

      calendar.render();
    }catch(err){
      // If calendar fails for any reason, reveal the original schedule list as a fallback
      console.warn('FullCalendar init failed:', err);
      var fallback = document.querySelector('.schedule-grid');
      if(fallback){
        fallback.classList.remove('visually-hidden');
        fallback.setAttribute('aria-hidden','false');
      }
      // also add a simple message for users
      if(root && root.parentNode){
        var p = document.createElement('p');
        p.className = 'calendar-fallback-note';
        p.textContent = 'Kalendarz chwilowo niedostępny — poniżej znajduje się lista terminów.';
        root.parentNode.insertBefore(p, root.nextSibling);
      }
    }
  });
})();

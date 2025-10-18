// calendar.js
// Render a month-by-month calendar (Apr-Oct 2025) and draw event bars based on .schedule-card elements present in the page.
// Assumptions: .schedule-card contains a <time class="trip-date"> with format "DD/MM - DD/MM" or "DD/MM - DD/MM" (same year 2025)
// and a .route element with text. Availability indicated by presence of .availability.sold-out.

(function(){
  function q(sel, ctx){ return (ctx||document).querySelector(sel); }
  function qAll(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }

  // parse trip-date like "26/04 - 03/05" into {start: Date, end: Date}
  function parseTripDate(str){
    // normalize
    str = str.trim();
    var parts = str.split('-').map(s=>s.trim());
    if(parts.length !== 2) return null;
    function toDate(part){
      var m = part.match(/(\d{1,2})\/(\d{1,2})/);
      if(!m) return null;
      var day = parseInt(m[1],10);
      var month = parseInt(m[2],10);
      // all events are in 2025
      return new Date(2025, month-1, day);
    }
    var s = toDate(parts[0]);
    var e = toDate(parts[1]);
    if(!s || !e) return null;
    return {start:s, end:e};
  }

  // build calendar months from Apr to Oct 2025 inclusive
  function buildCalendarRoot(root){
    var months = [];
    for(var m=3; m<=9; m++){ // 0-based months: Apr=3 .. Oct=9
      months.push({year:2025, month:m});
    }
    months.forEach(mobj => {
      var monthEl = document.createElement('section');
      monthEl.className = 'calendar-month';

      var header = document.createElement('div');
      header.className = 'calendar-month-header';
      var monthName = new Date(mobj.year, mobj.month, 1).toLocaleString('pl', {month:'long', year:'numeric'});
      header.innerHTML = '<strong>'+monthName+'</strong>';
      monthEl.appendChild(header);

      // weekday headings Mon..Sun
      var wk = document.createElement('div');
      wk.className = 'calendar-weekdays';
      var weekdayNames = ['Pon','Wt','Śr','Czw','Pt','Sob','Ndz'];
      weekdayNames.forEach(n => { var w = document.createElement('div'); w.textContent = n; wk.appendChild(w); });
      monthEl.appendChild(wk);

      var grid = document.createElement('div');
      grid.className = 'calendar-grid';

      // determine first day to show: start from the Monday on or before the 1st of month
      var first = new Date(mobj.year, mobj.month, 1);
      var firstDow = first.getDay(); // 0 Sun .. 6 Sat
      var daysBefore = (firstDow === 0) ? 6 : (firstDow - 1);
      var firstShown = new Date(first);
      firstShown.setDate(firstShown.getDate() - daysBefore);

      // last day to show: Sunday on or after last day of month
      var last = new Date(mobj.year, mobj.month+1, 0);
      var lastDow = last.getDay();
      var daysAfter = (lastDow === 0) ? 0 : (7 - lastDow);
      var lastShown = new Date(last);
      lastShown.setDate(lastShown.getDate() + daysAfter);

      // iterate from firstShown to lastShown
      for(var d = new Date(firstShown); d<=lastShown; d.setDate(d.getDate()+1)){
        var dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        if(d.getMonth() !== mobj.month) dayEl.classList.add('outside');
        var dateNum = document.createElement('div');
        dateNum.className = 'date-num';
        dateNum.textContent = d.getDate();
        dayEl.appendChild(dateNum);
        var iso = d.toISOString().slice(0,10);
        dayEl.dataset.date = iso;
        grid.appendChild(dayEl);
      }

      monthEl.appendChild(grid);

      // overlay for events (absolute positioned over the grid)
      var overlay = document.createElement('div');
      overlay.className = 'events-overlay';
      monthEl.appendChild(overlay);

      root.appendChild(monthEl);
    });
  }

  function dateToIso(d){ return d.toISOString().slice(0,10); }

  // place event bars spanning across the day cells for the given date range
  function placeEvents(root, events){
    // for each month overlay, compute pixel-accurate left/width using cell bounding boxes
    var months = qAll('.calendar-month', root);
    months.forEach(monthEl => {
      var overlay = monthEl.querySelector('.events-overlay');
      if(!overlay) return;
      // clear existing
      overlay.innerHTML = '';

      var header = monthEl.querySelector('.calendar-month-header');
      var weekdays = monthEl.querySelector('.calendar-weekdays');
      var grid = monthEl.querySelector('.calendar-grid');
      if(!grid) return;

      // set overlay top and height to match grid area
      var headerH = header ? header.getBoundingClientRect().height : 0;
      var wkH = weekdays ? weekdays.getBoundingClientRect().height : 0;
      overlay.style.top = (headerH + wkH) + 'px';
      overlay.style.height = grid.getBoundingClientRect().height + 'px';

      var cells = Array.from(grid.querySelectorAll('.calendar-day'));
      if(cells.length === 0) return;

      var gridRect = grid.getBoundingClientRect();
      var cellRects = {};
      cells.forEach((c,i)=> {
        var r = c.getBoundingClientRect();
        cellRects[c.dataset.date] = {rect: r, idx: i};
      });

      events.forEach((ev, evIndex) => {
        var evStart = new Date(ev.start);
        var evEnd = new Date(ev.end);
        var monthDates = cells.map(c=> new Date(c.dataset.date));
        var monthFirst = monthDates[0];
        var monthLast = monthDates[monthDates.length-1];
        if(evEnd < monthFirst || evStart > monthLast) return;

        var start = evStart < monthFirst ? monthFirst : evStart;
        var end = evEnd > monthLast ? monthLast : evEnd;
        var startIso = dateToIso(start);
        var endIso = dateToIso(end);
        var startRect = cellRects[startIso] && cellRects[startIso].rect;
        var endRect = cellRects[endIso] && cellRects[endIso].rect;
        if(!startRect || !endRect) return;

        var left = startRect.left - gridRect.left;
        var width = endRect.right - startRect.left;

        var bar = document.createElement('div');
        bar.className = 'event-bar ' + (ev.soldOut ? 'event-soldout' : 'event-available');
        bar.textContent = ev.route;
        bar.style.left = left + 'px';
        bar.style.width = Math.max(6, width) + 'px';
        bar.style.top = (6 + (evIndex%4) * 28) + 'px';
        overlay.appendChild(bar);
      });
    });
  }

  // recompute overlays on resize
  function refreshOverlays(){
    var root = document.getElementById('calendar-root');
    if(!root) return;
    var events = gatherEvents();
    placeEvents(root, events);
  }

  function gatherEvents(){
    var events = [];
    qAll('.schedule-card').forEach(card => {
      var timeEl = q('.trip-date', card) || q('time.trip-date', card);
      var rd = timeEl ? timeEl.textContent.trim() : '';
      // support both formats: "DD/MM - DD/MM" and "DD/MM - DD/MM" (some earlier examples had other separators)
      var parsed = parseTripDate(rd);
      if(!parsed) return;
      var routeEl = q('.route', card);
      var route = routeEl ? routeEl.textContent.trim() : '';
      var soldOut = !!card.querySelector('.availability.sold-out');
      events.push({start: parsed.start, end: parsed.end, route: route, soldOut: soldOut});
    });
    return events;
  }

  // init
  document.addEventListener('DOMContentLoaded', function(){
    var root = document.getElementById('calendar-root');
    if(!root) return;
    buildCalendarRoot(root);
    var events = gatherEvents();
    placeEvents(root, events);
    // refresh on resize to recompute pixel positions
    window.addEventListener('resize', function(){
      // debounce
      clearTimeout(window._calResize);
      window._calResize = setTimeout(function(){ refreshOverlays(); }, 120);
    });
  });
})();

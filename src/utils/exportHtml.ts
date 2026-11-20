import { EventData } from '../types/event';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateIcsCalendar(event: EventData): string {
  const startDate = new Date(event.eventDateISO);
  const validStart = isNaN(startDate.getTime()) ? new Date('2026-12-11T09:30:00+05:30') : startDate;
  const endDate = new Date(validStart.getTime() + 13 * 60 * 60 * 1000);

  const formatUtc = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jamiat Ulama Tumkur//Islah-e-Moashara 2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:jalsa-islah-2026-${validStart.getTime()}@jamiattumkur.org`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(validStart)}`,
    `DTEND:${formatUtc(endDate)}`,
    `SUMMARY:${event.eventTitle} — ${event.speaker.englishName}`,
    `LOCATION:${event.venueName}, ${event.venueAddress}`,
    `DESCRIPTION:${event.eventSubtitle} Hosted by ${event.organizationName}. ${event.entryNote}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function generateStandaloneHtml(event: EventData): string {
  const safeJson = JSON.stringify(event, null, 2).replace(/<\/script>/gi, '<\\/script>');
  const title = escapeHtml(event.eventTitle);
  const org = escapeHtml(event.organizationName);
  const desc = escapeHtml(event.eventSubtitle);

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} · ${escapeHtml(event.eventDateDisplay)}</title>
  <meta name="description" content="${desc}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <!--
    GITHUB PAGES READY SINGLE-FILE WEBSITE
    ======================================
    To update this page anytime:
    1. Scroll down to the "EDITABLE EVENT CONFIGURATION" block inside <script>.
    2. Update youtubeUrl, isLiveActive (set true on event day), dates, or schedule items.
    3. Place your poster image (e.g. poster.png) in the same GitHub folder and set posterImageUrl: "./poster.png".
    4. Commit and push to GitHub!
  -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Nastaliq+Urdu:wght@400;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    .font-serif-display { font-family: 'Cormorant Garamond', Georgia, serif; }
    .font-urdu { font-family: 'Noto Nastaliq Urdu', serif; }
    .font-mono-num { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
  </style>
</head>
<body class="bg-[#F8FAF8] text-[#111C17] antialiased">
  <header class="sticky top-0 z-40 bg-[#084E39]/95 backdrop-blur border-b border-white/10 text-white">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
      <a href="#top" class="font-serif-display text-xl font-bold tracking-tight whitespace-nowrap shrink-0" id="nav-org">${org}</a>
      <nav class="hidden md:flex items-center gap-6 text-sm text-[#D7E6DF]">
        <a href="#speaker" class="hover:text-white whitespace-nowrap shrink-0">Speaker</a>
        <a href="#schedule" class="hover:text-white whitespace-nowrap shrink-0">Schedule</a>
        <a href="#live" class="hover:text-white whitespace-nowrap shrink-0">Live Stream</a>
        <a href="#publicity" class="hover:text-white whitespace-nowrap shrink-0">Publicity</a>
      </nav>
      <a href="#live" class="px-4 py-2 text-xs font-semibold bg-[#C2DC62] text-[#063B2B] rounded-md hover:bg-[#d2ea78] whitespace-nowrap shrink-0">Watch Live</a>
    </div>
  </header>

  <main id="top">
    <section class="bg-[#084E39] text-white py-16 md:py-20 px-6">
      <div class="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
        <div class="lg:col-span-7 space-y-6">
          <p class="text-xs uppercase tracking-widest text-[#C2DC62]" id="hero-edition"></p>
          <p class="font-urdu text-2xl md:text-3xl text-[#E8F5B6] leading-loose" dir="rtl" id="hero-urdu-org"></p>
          <h1 class="font-serif-display text-4xl md:text-6xl font-bold leading-tight text-white" id="hero-title"></h1>
          <p class="text-[#D7E6DF] text-base md:text-lg max-w-2xl leading-relaxed" id="hero-subtitle"></p>
          <div class="pt-2 flex flex-wrap items-center gap-4">
            <a href="#schedule" class="px-6 py-3 bg-[#C2DC62] text-[#063B2B] font-semibold text-sm rounded-md hover:bg-[#d2ea78]">View Event Schedule</a>
            <a href="#live" class="px-6 py-3 border border-white/25 text-white font-medium text-sm rounded-md hover:bg-white/10">YouTube Live Stream</a>
          </div>
          <div class="pt-4 border-t border-white/15 grid grid-cols-4 gap-3 max-w-md font-mono-num" id="countdown-box"></div>
        </div>
        <div class="lg:col-span-5">
          <div class="bg-[#063B2B] p-3 rounded-lg border border-white/15">
            <img id="hero-poster" src="" alt="Official Event Poster" class="w-full h-auto rounded object-cover" />
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white border-b border-emerald-950/10 py-5 px-6">
      <div class="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm" id="utility-ribbon"></div>
    </section>

    <section id="speaker" class="max-w-6xl mx-auto px-6 py-16">
      <div class="grid lg:grid-cols-12 gap-12">
        <div class="lg:col-span-5 space-y-4">
          <p class="text-xs uppercase tracking-widest text-[#084E39] font-semibold">Keynote Speaker</p>
          <p class="font-urdu text-2xl text-[#084E39] leading-loose" dir="rtl" id="speaker-urdu"></p>
          <h2 class="font-serif-display text-3xl md:text-4xl font-bold text-[#111C17]" id="speaker-name"></h2>
          <p class="text-sm font-medium text-[#084E39]" id="speaker-honorific"></p>
          <p class="text-sm text-[#4A5D54]" id="speaker-profession"></p>
          <p class="text-sm text-[#4A5D54] leading-relaxed pt-2" id="speaker-bio"></p>
        </div>
        <div class="lg:col-span-7 bg-white border border-emerald-950/10 rounded-lg p-6 md:p-8">
          <h3 class="font-serif-display text-2xl font-bold mb-4 text-[#111C17]">Distinguished Scholarly Lineage &amp; Relations</h3>
          <dl class="divide-y divide-emerald-950/10 text-sm" id="relations-list"></dl>
        </div>
      </div>
    </section>

    <section id="schedule" class="bg-white border-y border-emerald-950/10 py-16 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p class="text-xs uppercase tracking-widest text-[#084E39] font-semibold">Programme · 11th December 2026</p>
            <h2 class="font-serif-display text-3xl md:text-4xl font-bold mt-1">Event Schedule</h2>
          </div>
          <div class="inline-flex p-1 bg-[#EFF4F0] rounded-lg gap-1" id="period-tabs"></div>
        </div>
        <div class="divide-y divide-emerald-950/10 border-t border-b border-emerald-950/10" id="schedule-rows"></div>
      </div>
    </section>

    <section id="live" class="max-w-6xl mx-auto px-6 py-16">
      <div class="bg-[#084E39] text-white rounded-xl p-6 md:p-10">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <p class="text-xs uppercase tracking-widest text-[#C2DC62]" id="live-status-label"></p>
            <h2 class="font-serif-display text-3xl font-bold mt-1">Live Conference Broadcast</h2>
          </div>
          <a id="youtube-external-link" href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="hidden px-4 py-2 bg-[#C2DC62] text-[#063B2B] text-xs font-semibold rounded-md">Open on YouTube</a>
        </div>
        <div id="live-player-container" class="aspect-video w-full rounded-lg overflow-hidden bg-[#063B2B] border border-white/15 flex items-center justify-center p-6 text-center"></div>
      </div>
    </section>

    <section id="publicity" class="max-w-6xl mx-auto px-6 pb-16">
      <div class="bg-white border border-emerald-950/10 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 class="font-serif-display text-2xl font-bold">Share Invitation Across Karnataka</h3>
          <p class="text-sm text-[#4A5D54] mt-1" id="publicity-venue"></p>
        </div>
        <button id="copy-whatsapp-btn" class="px-5 py-2.5 bg-[#084E39] text-white text-sm font-semibold rounded-md hover:bg-[#063B2B]">Copy WhatsApp Invitation</button>
      </div>
    </section>
  </main>

  <footer class="bg-[#063B2B] text-[#D7E6DF] py-10 px-6 text-sm">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-4">
      <p id="footer-org"></p>
      <p id="footer-contact"></p>
    </div>
  </footer>

  <script>
    // ===== EDITABLE EVENT CONFIGURATION =====
    // Edit any values below directly in GitHub or a text editor and save!
    const EVENT_CONFIG = ${safeJson};

    function parseYT(url) {
      if (!url) return null;
      const m = url.match(/(?:v=|youtu\\.be\\/|live\\/|embed\\/)([a-zA-Z0-9_-]{11})/) || url.match(/^([a-zA-Z0-9_-]{11})$/);
      return m ? m[1] : null;
    }

    document.getElementById('nav-org').textContent = EVENT_CONFIG.organizationName;
    document.getElementById('hero-edition').textContent = EVENT_CONFIG.editionLabel;
    document.getElementById('hero-urdu-org').textContent = EVENT_CONFIG.organizationUrdu;
    document.getElementById('hero-title').textContent = EVENT_CONFIG.eventTitle;
    document.getElementById('hero-subtitle').textContent = EVENT_CONFIG.eventSubtitle;
    document.getElementById('hero-poster').src = EVENT_CONFIG.posterImageUrl;

    document.getElementById('utility-ribbon').innerHTML = [
      ['Date & Day', EVENT_CONFIG.eventDateDisplay + ' · ' + EVENT_CONFIG.eventDayDisplay],
      ['Venue', EVENT_CONFIG.venueName + ', ' + EVENT_CONFIG.venueAddress],
      ['Gathering', EVENT_CONFIG.scopeNote],
      ['Admission', EVENT_CONFIG.entryNote]
    ].map(([k, v]) => '<div><div class="text-xs uppercase tracking-wider text-[#5A6D63]">' + k + '</div><div class="font-medium text-[#111C17] mt-1">' + v + '</div></div>').join('');

    document.getElementById('speaker-urdu').textContent = EVENT_CONFIG.speaker.urduName;
    document.getElementById('speaker-name').textContent = EVENT_CONFIG.speaker.englishName;
    document.getElementById('speaker-honorific').textContent = EVENT_CONFIG.speaker.honorificTitle + ' · ' + EVENT_CONFIG.speaker.almaMater;
    document.getElementById('speaker-profession').textContent = EVENT_CONFIG.speaker.profession;
    document.getElementById('speaker-bio').textContent = EVENT_CONFIG.speaker.bio;

    document.getElementById('relations-list').innerHTML = EVENT_CONFIG.speaker.relations
      .map(r => '<div class="py-3 flex flex-col sm:flex-row sm:justify-between gap-1"><dt class="font-medium text-[#111C17]">' + r.name + '</dt><dd class="text-[#5A6D63]">' + r.relation + '</dd></div>')
      .join('');

    let activePeriod = 'All';
    const periods = ['All', 'Morning', 'Afternoon', 'Evening'];
    function renderSchedule() {
      document.getElementById('period-tabs').innerHTML = periods.map(p =>
        '<button onclick="setPeriod(\\'' + p + '\\')" class="px-3 py-1.5 text-xs font-medium rounded-md ' +
        (activePeriod === p ? 'bg-[#084E39] text-white' : 'text-[#4A5D54] hover:text-[#111C17]') + '">' + p + '</button>'
      ).join('');
      const items = activePeriod === 'All' ? EVENT_CONFIG.schedule : EVENT_CONFIG.schedule.filter(s => s.period === activePeriod);
      document.getElementById('schedule-rows').innerHTML = items.map(s =>
        '<div class="py-5 grid md:grid-cols-12 gap-4 items-start">' +
          '<div class="md:col-span-3 font-mono-num text-sm font-medium text-[#084E39]">' + s.time + ' – ' + s.endTime + '<div class="text-xs text-[#5A6D63] font-sans mt-0.5">' + s.period + ' · ' + s.location + '</div></div>' +
          '<div class="md:col-span-9"><h3 class="text-lg font-semibold text-[#111C17]">' + s.title + '</h3><p class="text-sm text-[#084E39] font-medium mt-0.5">' + s.speaker + '</p><p class="text-sm text-[#4A5D54] mt-1.5">' + s.description + '</p></div>' +
        '</div>'
      ).join('');
    }
    window.setPeriod = function(p) { activePeriod = p; renderSchedule(); };
    renderSchedule();

    const ytId = parseYT(EVENT_CONFIG.youtubeUrl);
    const liveContainer = document.getElementById('live-player-container');
    const statusLabel = document.getElementById('live-status-label');
    const extLink = document.getElementById('youtube-external-link');
    if (ytId && EVENT_CONFIG.isLiveActive) {
      statusLabel.textContent = 'Streaming Live from Tumkur';
      extLink.href = 'https://www.youtube.com/watch?v=' + ytId;
      extLink.classList.remove('hidden');
      liveContainer.innerHTML = '<iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/' + ytId + '?rel=0" title="YouTube Live Conference" frameborder="0" allowfullscreen></iframe>';
    } else {
      statusLabel.textContent = 'Scheduled Broadcast · ' + EVENT_CONFIG.eventDateDisplay;
      liveContainer.innerHTML = '<div class="max-w-md space-y-2"><p class="text-lg font-serif-display font-bold text-white">YouTube Live Stream Standby</p><p class="text-sm text-[#D7E6DF]">' + EVENT_CONFIG.liveStreamNote + '</p></div>';
    }

    document.getElementById('publicity-venue').textContent = EVENT_CONFIG.venueName + ' · ' + EVENT_CONFIG.venueAddress;
    document.getElementById('footer-org').textContent = EVENT_CONFIG.organizationName + ' · Non-Profit Community Gathering';
    document.getElementById('footer-contact').textContent = EVENT_CONFIG.contactPhone + ' · ' + EVENT_CONFIG.contactEmail;

    document.getElementById('copy-whatsapp-btn').addEventListener('click', function() {
      const msg = '*' + EVENT_CONFIG.eventTitle + '*\\n' + EVENT_CONFIG.editionLabel + '\\nDate: ' + EVENT_CONFIG.eventDateDisplay + '\\nKeynote: ' + EVENT_CONFIG.speaker.englishName + '\\nVenue: ' + EVENT_CONFIG.venueName + ', ' + EVENT_CONFIG.venueAddress + '\\nFree Non-Profit Community Gathering — All are cordially invited.';
      navigator.clipboard.writeText(msg);
      this.textContent = 'Copied Invitation';
      setTimeout(() => { this.textContent = 'Copy WhatsApp Invitation'; }, 2000);
    });

    function updateCountdown() {
      const diff = Math.max(0, new Date(EVENT_CONFIG.eventDateISO).getTime() - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      document.getElementById('countdown-box').innerHTML = [['Days', d], ['Hours', h], ['Mins', m], ['Secs', s]]
        .map(([l, v]) => '<div class="bg-[#063B2B] border border-white/10 rounded px-3 py-2 text-center"><div class="text-xl font-bold text-[#C2DC62]">' + String(v).padStart(2, '0') + '</div><div class="text-[11px] uppercase tracking-wider text-[#D7E6DF]">' + l + '</div></div>').join('');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  </script>
</body>
</html>`;
}

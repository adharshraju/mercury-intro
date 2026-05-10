/* =============================================================
   MERCURY // PLAYER ONE — interactivity
   ============================================================= */


/* ─── Particle network background (hero canvas) ──────────── */
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const COUNT = 70;
  const LINK_DIST = 130;

  const particles = Array.from({ length: COUNT }, () => ({
    x:  Math.random() * canvas.width,
    y:  Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r:  Math.random() * 1.5 + 0.5,
    hue: Math.random() > 0.5 ? 280 : 190, // purple or cyan
  }));

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // links between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_DIST) {
          const a = (1 - d / LINK_DIST) * 0.4;
          const h = (particles[i].hue + particles[j].hue) / 2;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `hsla(${h}, 80%, 65%, ${a})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // glowing dots
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle  = `hsl(${p.hue}, 80%, 70%)`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `hsl(${p.hue}, 80%, 70%)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(tick);
  }
  tick();
})();


/* ─── Glitch burst on gamertag click ─────────────────────── */
(function initGlitchClick() {
  const glitch = document.getElementById('glitch');
  if (!glitch) return;
  glitch.addEventListener('click', () => {
    glitch.classList.remove('glitching');
    void glitch.offsetWidth; // force reflow so animation restarts
    glitch.classList.add('glitching');
    setTimeout(() => glitch.classList.remove('glitching'), 700);
  });
})();


/* ─── Cycling status badge ───────────────────────────────── */
(function initStatusCycler() {
  const statuses = [
    { text: 'ONLINE',                    color: '#4ade80', border: 'rgba(74,222,128,0.45)' },
    { text: '▶ IN GAME — VALORANT',      color: '#22d3ee', border: 'rgba(34,211,238,0.45)' },
    { text: '◌ AFK — BRB',               color: '#fbbf24', border: 'rgba(251,191,36,0.45)' },
    { text: '▶ IN GAME — ROCKET LEAGUE', color: '#a855f7', border: 'rgba(168,85,247,0.45)' },
    { text: '◉ STREAMING',               color: '#f87171', border: 'rgba(248,113,113,0.45)' },
  ];
  const badge = document.getElementById('statusBadge');
  const text  = document.getElementById('statusText');
  if (!badge || !text) return;

  let i = 0;
  setInterval(() => {
    i = (i + 1) % statuses.length;
    const s = statuses[i];
    badge.style.color       = s.color;
    badge.style.borderColor = s.border;
    text.textContent        = s.text;
  }, 4000);
})();


/* ─── Stat count-up on scroll ────────────────────────────── */
(function initStatCountUp() {
  const target = document.getElementById('stats');
  if (!target) return;

  let triggered = false;
  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || triggered) return;
    triggered = true;

    document.querySelectorAll('[data-target]').forEach(el => {
      const final    = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals || '0');
      const suffix   = el.dataset.suffix || '';
      const duration = 1500;
      const start    = performance.now();

      (function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (eased * final).toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(step);
      })(start);
    });
  }, { threshold: 0.25 });

  obs.observe(target);
})();


/* ─── Active nav link as you scroll ──────────────────────── */
(function initNavHighlight() {
  const links    = document.querySelectorAll('.nav-links a');
  const sections = ['games', 'achievements', 'stats', 'facts'];

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => {
        const active = a.getAttribute('href') === '#' + entry.target.id;
        a.style.color      = active ? '#22d3ee' : '';
        a.style.textShadow = active ? '0 0 10px #22d3ee' : '';
      });
    });
  }, { threshold: 0.4 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });
})();

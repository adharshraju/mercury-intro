/* =============================================================
   MERCURY // PLAYER ONE — interactivity
   ============================================================= */


/* ─── Shared reference (set by initStatusCycler) ─────────── */
let statusCycler;


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

  const COUNT     = 70;
  const LINK_DIST = 130;

  const particles = Array.from({ length: COUNT }, () => ({
    x:   Math.random() * canvas.width,
    y:   Math.random() * canvas.height,
    vx:  (Math.random() - 0.5) * 0.4,
    vy:  (Math.random() - 0.5) * 0.4,
    r:   Math.random() * 1.5 + 0.5,
    hue: Math.random() > 0.5 ? 280 : 190,
  }));

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle   = `hsl(${p.hue}, 80%, 70%)`;
      ctx.shadowBlur  = 8;
      ctx.shadowColor = `hsl(${p.hue}, 80%, 70%)`;
      ctx.fill();
      ctx.shadowBlur  = 0;
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
    void glitch.offsetWidth;
    glitch.classList.add('glitching');
    setTimeout(() => glitch.classList.remove('glitching'), 700);
  });
})();


/* ─── Status cycler ───────────────────────────────────────── */
statusCycler = (function initStatusCycler() {
  const STATUSES = [
    { text: 'ONLINE',                    color: '#4ade80', border: 'rgba(74,222,128,0.45)' },
    { text: '▶ IN GAME — VALORANT',      color: '#22d3ee', border: 'rgba(34,211,238,0.45)' },
    { text: '◌ AFK — BRB',               color: '#fbbf24', border: 'rgba(251,191,36,0.45)' },
    { text: '▶ IN GAME — ROCKET LEAGUE', color: '#a855f7', border: 'rgba(168,85,247,0.45)' },
    { text: '◉ STREAMING',               color: '#f87171', border: 'rgba(248,113,113,0.45)' },
  ];

  const badge = document.getElementById('statusBadge');
  const text  = document.getElementById('statusText');
  let idx     = 0;
  let timer   = null;

  function apply(s) {
    badge.style.color       = s.color;
    badge.style.borderColor = s.border;
    text.textContent        = s.text;
  }
  function tick() {
    idx = (idx + 1) % STATUSES.length;
    apply(STATUSES[idx]);
  }
  function start() { if (!timer) timer = setInterval(tick, 4000); }
  function stop()  { clearInterval(timer); timer = null; }

  start();
  return { start, stop, apply };
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
        const t     = Math.min((now - start) / duration, 1);
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
        const active   = a.getAttribute('href') === '#' + entry.target.id;
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


/* ─── Admin status control panel ─────────────────────────── */
(function initAdmin() {
  const PASSWORD_HASH = 'b769a6983b42d565e79bb4f3f534623453f301d39784e57804a649a67ea05327';
  const AUTH_KEY      = 'mercury_admin_auth';
  const STATUS_KEY    = 'mercury_status';

  const ADMIN_STATUSES = [
    { label: '● ONLINE',      text: 'ONLINE',       color: '#4ade80', border: 'rgba(74,222,128,0.45)' },
    { label: '▶ IN GAME',     text: null,            color: '#22d3ee', border: 'rgba(34,211,238,0.45)', isGame: true },
    { label: '◌ AFK — BRB',   text: '◌ AFK — BRB',  color: '#fbbf24', border: 'rgba(251,191,36,0.45)' },
    { label: '◉ STREAMING',   text: '◉ STREAMING',  color: '#f87171', border: 'rgba(248,113,113,0.45)' },
  ];

  const badgeEl = document.getElementById('statusBadge');

  // Apply any pinned status immediately on load
  applySavedStatus();
  refreshBadgeAdminState();

  // Ctrl+Alt+L toggles login / logout modal
  // (Ctrl+Shift+L is reserved by Chrome on Windows — focuses the omnibox)
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.altKey && !e.shiftKey && e.code === 'KeyL') {
      e.preventDefault();
      isLoggedIn() ? showLogoutModal() : showLoginModal();
    }
  });

  // Click the status badge to open the admin panel (only when logged in)
  badgeEl?.addEventListener('click', () => {
    if (isLoggedIn()) showAdminPanel();
  });

  function refreshBadgeAdminState() {
    badgeEl?.classList.toggle('is-admin', isLoggedIn());
  }

  // ── Helpers ───────────────────────────────────────────────
  function isLoggedIn() {
    return sessionStorage.getItem(AUTH_KEY) === '1';
  }

  async function verifyPassword(pw) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
    const hex = Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    return hex === PASSWORD_HASH;
  }

  function applySavedStatus() {
    const raw = localStorage.getItem(STATUS_KEY);
    if (!raw) return;
    try {
      statusCycler.stop();
      statusCycler.apply(JSON.parse(raw));
    } catch {
      localStorage.removeItem(STATUS_KEY);
    }
  }

  function pinStatus(s) {
    localStorage.setItem(STATUS_KEY, JSON.stringify(s));
    statusCycler.stop();
    statusCycler.apply(s);
  }

  function enableAutoCycle() {
    localStorage.removeItem(STATUS_KEY);
    statusCycler.start();
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    const afk = ADMIN_STATUSES.find(s => s.text === '◌ AFK — BRB');
    if (afk) pinStatus(afk);
    refreshBadgeAdminState();
  }

  // ── Overlay scaffolding ───────────────────────────────────
  function createOverlay() {
    const el = document.createElement('div');
    el.className = 'admin-overlay';
    el.addEventListener('click', e => { if (e.target === el) el.remove(); });
    return el;
  }
  function closeOverlay() {
    document.querySelector('.admin-overlay')?.remove();
  }

  // ── Login modal ───────────────────────────────────────────
  function showLoginModal() {
    const overlay = createOverlay();
    overlay.innerHTML = `
      <div class="admin-modal">
        <div class="admin-title">⚡ ADMIN ACCESS</div>
        <div class="admin-divider"></div>
        <label class="admin-label">PASSWORD</label>
        <input type="password" class="admin-input" id="adminPwInput"
               autocomplete="off" placeholder="••••••••">
        <div class="admin-error" id="adminError"></div>
        <div class="admin-row">
          <button class="admin-btn admin-btn-primary" id="adminEnterBtn">ENTER</button>
          <button class="admin-btn admin-btn-ghost"   id="adminCancelBtn">CANCEL</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('#adminPwInput');
    const error = overlay.querySelector('#adminError');
    const modal = overlay.querySelector('.admin-modal');
    // Defer focus past the current keydown so the triggering shortcut's
    // keypress (e.g. the "L" in Ctrl+Alt+L) doesn't leak into the input.
    setTimeout(() => { input.value = ''; input.focus(); }, 0);

    async function attempt() {
      const ok = await verifyPassword(input.value);
      if (ok) {
        sessionStorage.setItem(AUTH_KEY, '1');
        refreshBadgeAdminState();
        closeOverlay();
        showAdminPanel();
      } else {
        error.textContent = 'ACCESS DENIED';
        modal.classList.remove('shake');
        void modal.offsetWidth;
        modal.classList.add('shake');
        input.value = '';
        input.focus();
      }
    }

    overlay.querySelector('#adminEnterBtn').addEventListener('click', attempt);
    overlay.querySelector('#adminCancelBtn').addEventListener('click', closeOverlay);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });
  }

  // ── Admin panel ───────────────────────────────────────────
  function showAdminPanel() {
    const overlay = createOverlay();
    const saved   = localStorage.getItem(STATUS_KEY);
    const current = saved ? JSON.parse(saved) : null;

    const isAutoCycle = !current;

    let optionsHtml = ADMIN_STATUSES.map((s, i) => {
      const active = current && (
        s.isGame
          ? current.text?.startsWith('▶ IN GAME')
          : current.text === s.text
      );
      return `
        <div class="admin-option ${active ? 'is-active' : ''}">
          <span class="admin-option-label">${s.label}</span>
          <button class="admin-btn admin-btn-set" data-idx="${i}">SET</button>
        </div>
        ${s.isGame ? `
        <div class="admin-game-wrap" id="gameWrap">
          <input type="text" class="admin-input" id="gameNameInput"
                 placeholder="Which game?" maxlength="40"
                 value="${current?.text?.startsWith('▶ IN GAME') ? current.text.replace('▶ IN GAME — ', '') : ''}">
          <button class="admin-btn admin-btn-primary admin-btn-full" id="confirmGameBtn">CONFIRM GAME</button>
        </div>` : ''}
      `;
    }).join('');

    overlay.innerHTML = `
      <div class="admin-modal">
        <div class="admin-title">⚙ STATUS CONTROL</div>
        <div class="admin-divider"></div>
        <div class="admin-options">
          ${optionsHtml}
          <div class="admin-option ${isAutoCycle ? 'is-active' : ''}">
            <span class="admin-option-label">🔄 AUTO-CYCLE</span>
            <button class="admin-btn admin-btn-set" id="autoCycleBtn">SET</button>
          </div>
        </div>
        <div class="admin-divider"></div>
        <button class="admin-btn admin-btn-danger admin-btn-full" id="panelLogoutBtn">LOGOUT</button>
      </div>`;
    document.body.appendChild(overlay);

    // Game input starts hidden unless already in-game
    const gameWrap = overlay.querySelector('#gameWrap');
    if (gameWrap && !current?.text?.startsWith('▶ IN GAME')) {
      gameWrap.style.display = 'none';
    }

    // SET buttons
    overlay.querySelectorAll('[data-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = ADMIN_STATUSES[+btn.dataset.idx];
        if (s.isGame) {
          gameWrap.style.display = gameWrap.style.display === 'none' ? 'block' : 'none';
          if (gameWrap.style.display !== 'none') overlay.querySelector('#gameNameInput').focus();
        } else {
          pinStatus(s);
          closeOverlay();
        }
      });
    });

    // Confirm game name
    function confirmGame() {
      const game = overlay.querySelector('#gameNameInput').value.trim();
      if (!game) return;
      const base = ADMIN_STATUSES.find(s => s.isGame);
      pinStatus({ text: `▶ IN GAME — ${game.toUpperCase()}`, color: base.color, border: base.border });
      closeOverlay();
    }
    overlay.querySelector('#confirmGameBtn')?.addEventListener('click', confirmGame);
    overlay.querySelector('#gameNameInput')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') confirmGame();
    });

    // Auto-cycle
    overlay.querySelector('#autoCycleBtn').addEventListener('click', () => {
      enableAutoCycle();
      closeOverlay();
    });

    // Logout
    overlay.querySelector('#panelLogoutBtn').addEventListener('click', () => {
      logout();
      closeOverlay();
    });
  }

  // ── Logout modal ──────────────────────────────────────────
  function showLogoutModal() {
    const overlay = createOverlay();
    overlay.innerHTML = `
      <div class="admin-modal">
        <div class="admin-title">⚙ ADMIN SESSION</div>
        <div class="admin-divider"></div>
        <p class="admin-sub">You are currently logged in.</p>
        <button class="admin-btn admin-btn-primary admin-btn-full" id="goStatusBtn">STATUS CONTROL</button>
        <div class="admin-row" style="margin-top:0.5rem;">
          <button class="admin-btn admin-btn-danger" id="logoutBtn">LOGOUT</button>
          <button class="admin-btn admin-btn-ghost"  id="cancelBtn">CANCEL</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('#goStatusBtn').addEventListener('click', () => { closeOverlay(); showAdminPanel(); });
    overlay.querySelector('#logoutBtn').addEventListener('click', () => {
      logout();
      closeOverlay();
    });
    overlay.querySelector('#cancelBtn').addEventListener('click', closeOverlay);
  }

  // ── Dev helper exposed to console ─────────────────────────
  window.generateHash = async pw => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    console.log(`SHA-256("${pw}") = ${hex}`);
    console.log('Paste this value into the PASSWORD_HASH constant in script.js');
    return hex;
  };
})();

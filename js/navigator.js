/* ============================================================
   Astral of the Sun — shared shell
   Fonts, bottom navigation, network indicator, starfield,
   and the shared (empty) data layer + helpers used by every page.
   ============================================================ */
(function () {
  "use strict";

  window.Astral = window.Astral || {};

  /* ── Fonts: Poppins (body) + Montserrat (titles), loaded via <link> ── */
  Astral.fonts = Astral.fonts || {};
  Astral.fonts.wait = function () {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    const loads = [];
    ["Poppins", "Montserrat"].forEach((f) => {
      ["400", "500", "600", "700", "800"].forEach((w) => {
        try { loads.push(document.fonts.load(w + " 16px " + f)); } catch (e) {}
      });
    });
    return Promise.allSettled(loads);
  };

  /* ── Data layer — ships EMPTY (no fake data) ── */
  Astral.data = Astral.data || {
    player: { name: "", sub: "", avatar: "" },
    banner: "",
    stats: { level: null, solars: null, gems: null },
    counts: { shop: 0, roster: 0, dungeons: 0, friends: 0 },
    notifications: [],  // [{title, sub}]
    shop: [],           // [{name, desc, price, image}]
    season: {
      banner: "",        // URL ("" = placeholder)
      title: "", duration: "",
      tierIndex: 0, tierCount: 0,
      xpCurrent: 0, xpNeeded: 0,
      rewards: [],       // [{tier, title, image}]
      characters: [],    // [{name, meta, cp, image}]
      tiers: [],         // [{side: "free"|"premium", tier, title, image}]
    },
    inventory: [],      // [{id, name, image}]
    vault: [],          // [{id, name, image}]
    pvp: [],            // [{id, name, image}]
  };

  // Replace with your backend fetch. Resolves to nothing (keeps UI empty).
  Astral.loadData = function () { return Promise.resolve(null); };

  /* ── helpers ── */
  Astral.$ = function (sel, root) { return (root || document).querySelector(sel); };
  Astral.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  Astral.lookup = function (path) {
    return path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), Astral.data);
  };

  Astral.bind = function (root) {
    Astral.$$("[data-bind]", root || document).forEach((el) => {
      const v = Astral.lookup(el.getAttribute("data-bind"));
      el.textContent = (v === null || v === undefined || v === "") ? "" : String(v);
    });
  };

  Astral.coin = function (size) {
    const s = size || 12;
    return '<svg class="coin" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="9" fill="#f5c44a"/>' +
      '<circle cx="12" cy="12" r="6.4" fill="#e6a90d"/>' +
      '<text x="12" y="16.2" text-anchor="middle" font-size="12" font-weight="700" fill="#7a5200">$</text></svg>';
  };

  Astral.empty = function (container, label) {
    if (!container) return;
    container.innerHTML = "";
    const d = document.createElement("div");
    d.className = "empty-note";
    d.textContent = label == null ? "Nothing here yet" : label;
    container.appendChild(d);
  };

  Astral.image = function (host, url, alt, cls) {
    // sets a background or adds an <img> only when a real URL is provided
    if (!host || !url) return;
    if (host.tagName === "IMG") {
      host.src = url;
      host.alt = alt || "";
      host.classList.add("has-img");
      return;
    }
    host.style.backgroundImage = 'url("' + url + '")';
    host.classList.add("has-img");
  };

  /* ── bottom navigation (multi-page) ── */
  function initNav() {
    const tabs = Astral.$$(".nav-tab");
    const pill = Astral.$("#navPill");
    const inner = Astral.$(".bottom-nav-inner");
    const page = (document.body && document.body.getAttribute("data-page")) || "";

    function move(tab) {
      if (!tab || !pill || !inner) return;
      const r = tab.getBoundingClientRect();
      const pr = inner.getBoundingClientRect();
      pill.style.left = (r.left + r.width / 2 - pr.left - pill.offsetWidth / 2) + "px";
    }

    tabs.forEach((tab) => {
      if (tab.getAttribute("data-page") === page) tab.classList.add("active");
      else tab.classList.remove("active");
      tab.addEventListener("click", () => {
        const href = tab.getAttribute("data-href");
        if (href) { window.location.href = href; return; }
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        move(tab);
      });
    });

    if (inner && pill) {
      window.addEventListener("resize", () => move(Astral.$(".nav-tab.active")));
      requestAnimationFrame(() => move(Astral.$(".nav-tab.active")));
    }

    const nav = Astral.$("#bottomNav");
    if (!nav) return;
    let lastY = window.scrollY, ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY, delta = y - lastY;
        if (y > 40 && delta > 4) nav.classList.add("nav-hidden");
        else if (delta < -4 || y <= 40) nav.classList.remove("nav-hidden");
        lastY = y;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── network signal indicator ── */
  function initNetstat() {
    const ring = Astral.$("#netstatRing");
    if (!ring) return;
    function apply() {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      let level = "high";
      if (conn) {
        const type = conn.effectiveType;
        const dl = typeof conn.downlink === "number" ? conn.downlink : null;
        if (type === "slow-2g" || type === "2g" || (dl !== null && dl < 1)) level = "low";
        else if (type === "3g" || (dl !== null && dl < 5)) level = "medium";
        else level = "high";
      } else if (typeof navigator.onLine === "boolean" && !navigator.onLine) {
        level = "low";
      }
      ring.classList.remove("signal-high", "signal-medium", "signal-low");
      ring.classList.add("signal-" + level);
    }
    apply();
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.addEventListener) conn.addEventListener("change", apply);
    window.addEventListener("online", apply);
    window.addEventListener("offline", apply);
  }

  /* ── ambient starfield ── */
  function initStarfield() {
    const canvas = Astral.$("#c");
    if (!canvas) return;
    const ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return;
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    const FS = 0.25, FE = 0.48;
    const rand = (a, b) => Math.random() * (b - a) + a;
    const spawnX = () => { const cx = canvas.width / 2, s = canvas.width * 0.18; return cx + (rand(-1, 1) + rand(-1, 1)) * s * 0.5; };
    const mk = (sc) => ({
      x: spawnX(),
      y: sc ? rand(-canvas.height * 0.5, 0) : rand(-10, -2),
      size: rand(0.2, 0.6), speed: rand(0.08, 0.28), drift: rand(-0.05, 0.05), opacity: rand(0.08, 0.22),
    });
    const pts = Array.from({ length: 120 }, () => mk(true));
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        const t = p.y / canvas.height;
        const a = t < FS ? p.opacity : (t > FE ? 0 : p.opacity * (1 - ((t - FS) / (FE - FS)) ** 2));
        p.y += p.speed; p.x += p.drift;
        if (p.y > canvas.height * FE + 5) { Object.assign(p, mk(false)); continue; }
        if (a <= 0) continue;
        ctx.save(); ctx.globalAlpha = a; ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = "rgba(220,180,80,1)"; ctx.fill(); ctx.restore();
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ── page title from data-page, when present ── */
  function initTitle() {
    const el = Astral.$("[data-page-title]");
    if (!el) return;
    const map = { home: "Home", season: "Season", shop: "Shop", profile: "Profile" };
    const page = (document.body && document.body.getAttribute("data-page")) || "";
    el.textContent = map[page] || "Astral of the Sun";
  }

  function boot() {
    document.documentElement.classList.remove("no-js");
    initTitle();
    initNav();
    initNetstat();
    initStarfield();
    Astral.fonts.wait();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

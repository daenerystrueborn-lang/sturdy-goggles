/* ============================================================
   Astral of the Sun — shared shell
   Fonts, bottom navigation, network indicator, starfield,
   the shared (empty) data layer + helpers used by every page,
   and a client-side router so switching pages doesn't reload
   the whole document (scripts, fonts and starfield persist).
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
    topup: {
      solars: [],       // [{id, title, amount, price, currency, image}]
      gems: [],         // [{id, title, amount, price, currency, image}]
      premium: [],      // [{id, title, desc, price, currency, image}]
      offers: [],       // [{id, title, desc, image}]  — server offers
    },
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

  Astral.gemIcon = function (size) {
    const s = size || 12;
    return '<svg class="gem" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M6 3h12l4 6-10 12L2 9l4-6Z" fill="rgba(122,222,255,0.25)" stroke="#7adeff" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<path d="M2 9h20M9 3 7 9l5 12M15 3l2 6-5 12" stroke="rgba(122,222,255,0.5)" stroke-width="1" stroke-linejoin="round"/></svg>';
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

  /* ============================================================
     Client-side router — switch pages without a full reload.
     Each page's <main> is fetched once, cached, and swapped in;
     the per-page script is injected on first visit and reused.
     Direct loads and the back button still work (pushState).
     ============================================================ */
  Astral.pages = Astral.pages || {};            // name -> init fn registered by the page script
  Astral.registerPage = function (name, fn) { Astral.pages[name] = fn; };

  Astral.pageMeta = {
    home:    { file: "index.html",   script: "js/app.js",     title: "Astral of the Sun — Home" },
    season:  { file: "season.html",  script: "js/season.js",  title: "Astral of the Sun — Season" },
    shop:    { file: "shop.html",    script: "js/shop.js",    title: "Astral of the Sun — Shop" },
    profile: { file: "profile.html", script: "js/profile.js", title: "Astral of the Sun — Profile" },
    topup:   { file: "topup.html",   script: "js/topup.js",   title: "Astral of the Sun — Top-up" },
  };

  const pageCache = {};

  function fetchPage(name) {
    if (pageCache[name]) return Promise.resolve(pageCache[name]);
    const meta = Astral.pageMeta[name];
    if (!meta || !window.fetch) return Promise.reject(new Error("no fetch"));
    return fetch(meta.file, { cache: "force-cache" })
      .then((r) => { if (!r.ok) throw new Error("http " + r.status); return r.text(); })
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const main = doc.querySelector("main");
        const tpl = Array.prototype.map.call(doc.querySelectorAll("template"), (t) => t.outerHTML).join("");
        pageCache[name] = {
          mainHTML: main ? main.innerHTML : "",
          mainClass: main ? main.className : "",
          tpl: tpl,
        };
        return pageCache[name];
      });
  }

  // resolves true when the script was just injected (it self-initialises)
  function ensureScript(name) {
    if (Astral.pages[name]) return Promise.resolve(false);
    const meta = Astral.pageMeta[name];
    if (!meta) return Promise.resolve(false);
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = meta.script;
      s.async = false;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }

  function movePill(tab) {
    const pill = Astral.$("#navPill");
    const inner = Astral.$(".bottom-nav-inner");
    if (!tab || !pill || !inner) return;
    const r = tab.getBoundingClientRect();
    const pr = inner.getBoundingClientRect();
    pill.style.left = (r.left + r.width / 2 - pr.left - pill.offsetWidth / 2) + "px";
  }

  function pageFromLocation() {
    const path = (location.pathname.split("/").pop() || "index.html");
    for (const k in Astral.pageMeta) if (Astral.pageMeta[k].file === path) return k;
    return "home";
  }

  Astral.go = function (name, opts) {
    opts = opts || {};
    const meta = Astral.pageMeta[name];
    if (!meta) return Promise.resolve();
    const current = (document.body && document.body.getAttribute("data-page")) || "";
    if (name === current && !opts.force) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return Promise.resolve();
    }

    Astral.topupHint = opts.currency || null;   // consumed by the top-up page

    return fetchPage(name)
      .then((entry) => {
        const old = document.querySelector("main");
        const fresh = document.createElement("main");
        fresh.className = entry.mainClass;
        fresh.innerHTML = entry.mainHTML;
        if (old) old.replaceWith(fresh);
        else document.body.insertBefore(fresh, document.body.firstChild);

        // templates live outside <main> on some pages — carry them over once
        if (entry.tpl) {
          const wrap = document.createElement("div");
          wrap.innerHTML = entry.tpl;
          Array.prototype.forEach.call(wrap.children, (node) => {
            if (node.tagName === "TEMPLATE" && node.id && !document.getElementById(node.id)) {
              document.body.appendChild(node);
            }
          });
        }

        document.body.setAttribute("data-page", name);
        document.title = meta.title;

        Astral.$$(".nav-tab").forEach((t) => {
          t.classList.toggle("active", t.getAttribute("data-page") === name);
        });
        movePill(Astral.$('.nav-tab[data-page="' + name + '"]'));
        window.scrollTo(0, 0);

        return ensureScript(name).then((justLoaded) => {
          // freshly injected scripts self-initialise; revisits need a manual init
          if (!justLoaded && typeof Astral.pages[name] === "function") Astral.pages[name]();
          if (opts.push !== false) {
            try { history.pushState({ page: name }, "", meta.file); } catch (e) {}
          }
        });
      })
      .catch(() => { window.location.href = meta.file; });  // full-reload fallback
  };

  /* ── bottom navigation (multi-page) ── */
  function initNav() {
    const tabs = Astral.$$(".nav-tab");
    const page = (document.body && document.body.getAttribute("data-page")) || "";

    tabs.forEach((tab) => {
      if (tab.getAttribute("data-page") === page) tab.classList.add("active");
      else tab.classList.remove("active");
      tab.addEventListener("click", () => {
        Astral.go(tab.getAttribute("data-page"));
      });
    });

    window.addEventListener("resize", () => movePill(Astral.$(".nav-tab.active")));
    requestAnimationFrame(() => movePill(Astral.$(".nav-tab.active")));

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

  /* ── in-page links: any element with data-go="page" ── */
  function initDelegatedNav() {
    document.addEventListener("click", (e) => {
      const el = e.target && e.target.closest ? e.target.closest("[data-go]") : null;
      if (!el) return;
      e.preventDefault();
      Astral.go(el.getAttribute("data-go"), { currency: el.getAttribute("data-currency") || null });
    });
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
    const map = { home: "Home", season: "Season", shop: "Shop", profile: "Profile", topup: "Top-up" };
    const page = (document.body && document.body.getAttribute("data-page")) || "";
    el.textContent = map[page] || "Astral of the Sun";
  }

  function boot() {
    document.documentElement.classList.remove("no-js");
    initTitle();
    initNav();
    initNetstat();
    initStarfield();
    initDelegatedNav();
    Astral.fonts.wait();

    // keep the URL/history consistent for the router
    const current = (document.body && document.body.getAttribute("data-page")) || "home";
    try {
      history.replaceState({ page: current }, "", (Astral.pageMeta[current] || {}).file || location.href);
    } catch (e) {}

    window.addEventListener("popstate", () => {
      Astral.go(pageFromLocation(), { push: false });
    });

    // warm the page cache so the first switch is instant
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 350));
    idle(() => { Object.keys(Astral.pageMeta).forEach((n) => { fetchPage(n).catch(() => {}); }); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

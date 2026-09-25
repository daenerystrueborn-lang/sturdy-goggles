/* ============================================================
   Astral of the Sun — app logic
   Data-driven and dependency-free. All data ships EMPTY by
   default (no fake numbers, names or images). Fill `state`
   from your API / backend before calling `render()`.
   ============================================================ */

(function () {
  "use strict";

  /* ── DATA LAYER ──────────────────────────────────────────
     Everything below is empty. Wire `loadState()` to your
     backend (fetch/WebSocket/etc.) to hydrate the UI.
     Coin icon is hard-coded into the currency slots, so it
     only shows where a currency value is actually rendered.
     ------------------------------------------------------- */
  const state = {
    player: { name: "", sub: "", avatar: "" },           // avatar = URL ("" = placeholder)
    banner: "",                                          // URL ("" = placeholder)
    stats: { level: null, solars: null, gems: null },
    counts: { shop: 0, roster: 0, dungeons: 0, friends: 0 },
    shop: [],                                            // [{name, desc, price, image}]
    roster: [],                                          // [{name, meta, cp, image}]
    dungeons: [],                                        // [{name, sub, diff}]
    friends: [],                                         // [{name, avatar}]
    notifications: [],                                   // [{title, sub}]
  };

  // Replace this with your real data source.
  function loadState() {
    return Promise.resolve(null); // returns nothing — UI stays empty
  }

  /* ── tiny helpers ── */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ── binding ── */
  function bindText(root) {
    $$("[data-bind]", root || document).forEach((el) => {
      const key = el.dataset.bind;
      const val = lookup(key);
      el.textContent = (val === null || val === undefined || val === "") ? "" : String(val);
    });
  }

  function lookup(path) {
    return path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), state);
  }

  /* ── list renderers ── */
  const TEMPLATES = {
    shopCard: "tpl-shopCard",
    rosterCard: "tpl-rosterCard",
    dungeonRow: "tpl-dungeonRow",
    friendRow: "tpl-friendRow",
  };

  function renderList(containerSelector, templateId, items) {
    const container = $(containerSelector);
    if (!container) return;
    container.innerHTML = "";
    const tpl = document.getElementById(templateId);
    if (!tpl || !Array.isArray(items)) return;

    items.forEach((item) => {
      const node = tpl.content.cloneNode(true);

      // images: only render when a real URL is provided
      if (item.image) {
        const slot = node.querySelector(".roster-avatar, .shop-icon");
        if (slot) {
          const img = document.createElement("img");
          img.src = item.image;
          img.alt = item.name || "";
          slot.appendChild(img);
          slot.classList.add("has-img");
        }
      }

      // difficulty accent
      const row = node.firstElementChild;
      if (item.diff && row) row.classList.add("diff-" + String(item.diff).toLowerCase());

      // bind text using the item as the root
      $$("[data-bind]", node).forEach((el) => {
        el.textContent = item[el.dataset.bind] == null ? "" : String(item[el.dataset.bind]);
      });

      container.appendChild(node);
    });

    // friend avatars get the stacked style
    if (items.length) {
      $$(".friend-avatar", container).forEach((av) => {
        // keep default placeholder person icon
      });
    }
  }

  function syncCounts() {
    state.counts.shop = state.shop.length;
    state.counts.roster = state.roster.length;
    state.counts.dungeons = state.dungeons.length;
    state.counts.friends = state.friends.length;
    setBind("counts.shop", state.counts.shop);
    setBind("counts.roster", state.counts.roster);
    setBind("counts.dungeons", state.counts.dungeons);
    setBind("counts.friends", state.counts.friends);
  }

  function setBind(key, value) {
    $$('[data-bind="' + key + '"]').forEach((el) => { el.textContent = String(value); });
  }

  function renderHeader() {
    const cube = $("#avatarCube");
    if (cube) {
      if (state.player.avatar) {
        if (!cube.querySelector("img")) {
          const img = document.createElement("img");
          img.alt = "Player avatar";
          cube.appendChild(img);
        }
        cube.querySelector("img").src = state.player.avatar;
        cube.classList.add("has-img");
      } else {
        cube.classList.remove("has-img");
        const img = cube.querySelector("img");
        if (img) img.remove();
      }
    }
    bindText($(".profile-card"));
    bindText($(".stats-row"));

    // banner
    const box = $("#mainBox");
    if (box) {
      if (state.banner) box.style.backgroundImage = 'url("' + state.banner + '")';
      else box.style.backgroundImage = "";
    }

    // notifications
    const dd = $("#notifDropdown");
    const dot = $("#notifDot");
    if (dd) {
      dd.innerHTML = "";
      if (state.notifications.length) {
        state.notifications.forEach((n) => {
          const item = document.createElement("div");
          item.className = "notif-item";
          const t = document.createElement("div");
          t.className = "notif-item-title";
          t.textContent = n.title || "";
          const s = document.createElement("div");
          s.className = "notif-item-sub";
          s.textContent = n.sub || "";
          item.appendChild(t);
          item.appendChild(s);
          dd.appendChild(item);
        });
      } else {
        const empty = document.createElement("div");
        empty.className = "notif-empty";
        empty.textContent = "No new notifications";
        dd.appendChild(empty);
      }
    }
    if (dot) dot.hidden = state.notifications.length === 0;
  }

  function render() {
    renderHeader();
    renderList("#shopGrid", TEMPLATES.shopCard, state.shop);
    renderList("#rosterScroll", TEMPLATES.rosterCard, state.roster);
    renderList("#dungeonList", TEMPLATES.dungeonRow, state.dungeons);
    renderList("#friendsRow", TEMPLATES.friendRow, state.friends);
    syncCounts();
  }

  /* ── UI behaviours ── */

  // bottom nav pill + tabs
  function initNav() {
    const tabs = $$(".nav-tab");
    const pill = $("#navPill");
    const navInner = $(".bottom-nav-inner");
    if (!pill || !navInner || !tabs.length) return;

    function movePill(tab) {
      if (!tab) return;
      const rect = tab.getBoundingClientRect();
      const parentRect = navInner.getBoundingClientRect();
      const cx = rect.left + rect.width / 2 - parentRect.left;
      pill.style.left = cx - pill.offsetWidth / 2 + "px";
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        movePill(tab);
      });
    });

    window.addEventListener("resize", () => movePill($(".nav-tab.active")));
    requestAnimationFrame(() => movePill($(".nav-tab.active")));

    // hide on scroll down, reveal on scroll up
    const bottomNav = $("#bottomNav");
    if (!bottomNav) return;
    let lastY = window.scrollY;
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const delta = y - lastY;
          if (y > 40 && delta > 4) bottomNav.classList.add("nav-hidden");
          else if (delta < -4 || y <= 40) bottomNav.classList.remove("nav-hidden");
          lastY = y;
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  // notifications dropdown
  function initNotifications() {
    const btn = $("#notifBtn");
    const dd = $("#notifDropdown");
    if (!btn || !dd) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = dd.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", (e) => {
      if (!btn.contains(e.target) && !dd.contains(e.target)) {
        dd.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // network signal strength
  function initNetstat() {
    const ring = $("#netstatRing");
    if (!ring) return;

    function applySignal() {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      let level = "high";
      if (conn) {
        const type = conn.effectiveType;
        const downlink = typeof conn.downlink === "number" ? conn.downlink : null;
        if (type === "slow-2g" || type === "2g" || (downlink !== null && downlink < 1)) level = "low";
        else if (type === "3g" || (downlink !== null && downlink < 5)) level = "medium";
        else level = "high";
      } else if (typeof navigator.onLine === "boolean" && !navigator.onLine) {
        level = "low";
      }
      ring.classList.remove("signal-high", "signal-medium", "signal-low");
      ring.classList.add("signal-" + level);
    }

    applySignal();
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.addEventListener) conn.addEventListener("change", applySignal);
    window.addEventListener("online", applySignal);
    window.addEventListener("offline", applySignal);
  }

  // ambient starfield background
  function initCanvas() {
    const canvas = $("#c");
    if (!canvas) return;
    const ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return; // no canvas support → just leave the black background

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const FS = 0.25, FE = 0.48;
    const rand = (a, b) => Math.random() * (b - a) + a;
    const spawnX = () => {
      const cx = canvas.width / 2, s = canvas.width * 0.18;
      return cx + (rand(-1, 1) + rand(-1, 1)) * s * 0.5;
    };
    const mkP = (sc) => ({
      x: spawnX(),
      y: sc ? rand(-canvas.height * 0.5, 0) : rand(-10, -2),
      size: rand(0.2, 0.6),
      speed: rand(0.08, 0.28),
      drift: rand(-0.05, 0.05),
      opacity: rand(0.08, 0.22),
    });
    const pts = Array.from({ length: 120 }, () => mkP(true));

    function alpha(p) {
      const t = p.y / canvas.height;
      if (t < FS) return p.opacity;
      if (t > FE) return 0;
      return p.opacity * (1 - ((t - FS) / (FE - FS)) ** 2);
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        const a = alpha(p);
        p.y += p.speed;
        p.x += p.drift;
        if (p.y > canvas.height * FE + 5) { Object.assign(p, mkP(false)); continue; }
        if (a <= 0) continue;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(220,180,80,1)";
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ── boot ── */
  function boot() {
    document.documentElement.classList.remove("no-js");
    initNav();
    initNotifications();
    initNetstat();
    initCanvas();

    loadState().then(() => render()).catch(() => render());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

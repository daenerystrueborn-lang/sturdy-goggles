/* ============================================================
   Astral of the Sun — Home page
   Depends on js/navigator.js (loads first) for the shared
   Astral shell, empty data layer, nav and starfield.
   ============================================================ */
(function () {
  "use strict";

  function render() {
    const D = window.Astral.data;
    const $ = window.Astral.$;
    const $$ = window.Astral.$$;
    const bind = window.Astral.bind;
    const empty = window.Astral.empty;
    const image = window.Astral.image;

    // profile header
    const cube = $("#avatarCube");
    if (cube) {
      if (D.player.avatar) {
        if (!cube.querySelector("img")) {
          const img = document.createElement("img");
          img.alt = "Player avatar";
          cube.appendChild(img);
        }
        cube.querySelector("img").src = D.player.avatar;
        cube.classList.add("has-img");
      } else {
        cube.classList.remove("has-img");
        const img = cube.querySelector("img");
        if (img) img.remove();
      }
    }
    bind($(".profile-card"));
    bind($(".stats-row"));

    // banner
    const box = $("#mainBox");
    if (box) box.style.backgroundImage = D.banner ? 'url("' + D.banner + '")' : "";

    // notifications
    const dd = $("#notifDropdown");
    const dot = $("#notifDot");
    if (dd) {
      dd.innerHTML = "";
      if (D.notifications && D.notifications.length) {
        D.notifications.forEach((n) => {
          const item = document.createElement("div");
          item.className = "notif-item";
          const t = document.createElement("div");
          t.className = "notif-item-title";
          t.textContent = n.title || "";
          const s = document.createElement("div");
          s.className = "notif-item-sub";
          s.textContent = n.sub || "";
          item.appendChild(t); item.appendChild(s);
          dd.appendChild(item);
        });
      } else {
        const e = document.createElement("div");
        e.className = "notif-empty";
        e.textContent = "No new notifications";
        dd.appendChild(e);
      }
    }
    if (dot) dot.hidden = !D.notifications || D.notifications.length === 0;
  }

  function renderLists() {
    const D = window.Astral.data;
    const $ = window.Astral.$;
    const $$ = window.Astral.$$;
    const empty = window.Astral.empty;

    const pairs = [
      ["#shopGrid", "tpl-shopCard", D.shop, "No items in the shop"],
      ["#rosterScroll", "tpl-rosterCard", D.roster, "No Pokémon ready"],
      ["#dungeonList", "tpl-dungeonRow", D.dungeons, "No dungeons available"],
      ["#friendsRow", "tpl-friendRow", D.friends, "No friends yet"],
    ];

    pairs.forEach(([sel, tplId, items, emptyLabel]) => {
      const container = $(sel);
      if (!container) return;
      const tpl = document.getElementById(tplId);
      if (!items || !items.length) { empty(container, emptyLabel); return; }
      container.innerHTML = "";
      items.forEach((item) => {
        const node = tpl.content.cloneNode(true);
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
        const row = node.firstElementChild;
        if (item.diff && row) row.classList.add("diff-" + String(item.diff).toLowerCase());
        $$("[data-bind]", node).forEach((el) => {
          el.textContent = item[el.getAttribute("data-bind")] == null ? "" : String(item[el.getAttribute("data-bind")]);
        });
        container.appendChild(node);
      });
    });

    // counts
    D.counts = D.counts || {};
    D.counts.shop = (D.shop || []).length;
    D.counts.roster = (D.roster || []).length;
    D.counts.dungeons = (D.dungeons || []).length;
    D.counts.friends = (D.friends || []).length;
    window.Astral.bind(document);
  }

  function boot() {
    render();
    renderLists();
    if (window.Astral.loadData) {
      window.Astral.loadData().then(() => { render(); renderLists(); }).catch(() => {});
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

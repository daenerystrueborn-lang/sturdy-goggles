/* ============================================================
   Astral of the Sun — Season page
   ============================================================ */
(function () {
  "use strict";

  let mode = "free"; // "free" | "premium"

  function bindStrip(container, items, emptyLabel) {
    const A = window.Astral;
    if (!container) return;
    if (!items || !items.length) { A.empty(container, emptyLabel); return; }
    container.innerHTML = "";
    items.forEach((it) => {
      const d = document.createElement("div");
      d.className = "reward";
      d.innerHTML =
        '<div class="reward-thumb img-ph" role="img" aria-label="' + (it.title || "") + '"></div>' +
        '<div class="reward-tier">' + (it.tier != null ? String(it.tier) : "") + "</div>" +
        '<div class="reward-title"></div>';
      d.querySelector(".reward-title").textContent = it.title || "";
      const thumb = d.querySelector(".reward-thumb");
      if (it.image) { thumb.style.backgroundImage = 'url("' + it.image + '")'; thumb.classList.add("has-img"); } else thumb.classList.remove("has-img");
      container.appendChild(d);
    });
  }

  function buildTracks(items) {
    const A = window.Astral;
    const single = A.$("#passTrack");
    if (!single) return;
    if (!items || !items.length) { A.empty(single, "No rewards yet"); return; }
    single.innerHTML = "";
    items.forEach((it) => {
      const side = it.side === "premium" ? "premium" : "free";
      const row = document.createElement("div");
      row.className = "track-row";
      row.innerHTML =
        '<span class="track-side ' + side + '">' + (side === "premium" ? "PREMIUM" : "FREE") + "</span>" +
        '<div class="track-thumb img-ph" role="img" aria-label="' + (it.title || "") + '"></div>' +
        '<div class="track-info">' +
          '<div class="track-tier">' + (it.tier != null ? "Tier " + String(it.tier) : "") + "</div>" +
          '<div class="track-title"></div>' +
        "</div>";
      row.querySelector(".track-title").textContent = it.title || "";
      const thumb = row.querySelector(".track-thumb");
      if (it.image) { thumb.style.backgroundImage = 'url("' + it.image + '")'; thumb.classList.add("has-img"); } else thumb.classList.remove("has-img");
      single.appendChild(row);
    });
  }

  function renderCharacters(items) {
    const A = window.Astral;
    const grid = A.$("#seasonChars");
    if (!grid) return;
    if (!items || !items.length) { A.empty(grid, "No season characters"); return; }
    grid.innerHTML = "";
    items.forEach((it) => {
      const d = document.createElement("div");
      d.className = "season-char";
      d.innerHTML =
        '<div class="season-char-av img-ph" role="img" aria-label="' + (it.name || "") + '"></div>' +
        '<div class="season-char-name"></div>' +
        '<div class="season-char-meta"></div>' +
        '<div class="season-char-cp"></div>';
      d.querySelector(".season-char-name").textContent = it.name || "";
      d.querySelector(".season-char-meta").textContent = it.meta || "";
      d.querySelector(".season-char-cp").textContent = it.cp || "";
      const av = d.querySelector(".season-char-av");
      if (it.image) { av.style.backgroundImage = 'url("' + it.image + '")'; av.classList.add("has-img"); } else av.classList.remove("has-img");
      grid.appendChild(d);
    });
  }

  function render() {
    const A = window.Astral;
    const D = A.data;
    const S = D.season || {};

    // banner
    A.image(A.$("#seasonBanner"), D.seasonBanner || S.banner, "Season banner");

    // header
    A.bind(document);

    // xp bar
    const fill = A.$("#passBarFill");
    if (fill) {
      const cur = Number(S.xpCurrent) || 0;
      const need = Number(S.xpNeeded) || 0;
      fill.style.width = (need > 0 ? Math.min(100, (cur / need) * 100) : 0) + "%";
    }

    // free / premium tabs swap track list
    const items = mode === "premium"
      ? (S.tiers || []).filter((t) => t.side === "premium")
      : (S.tiers || []).filter((t) => t.side !== "premium");

    buildTracks(items);

    bindStrip(A.$("#rewardStrip"), S.rewards, "No rewards yet");
    renderCharacters(S.characters);

    // counts
    D.counts = D.counts || {};
    D.counts.rewards = (S.rewards || []).length;
    D.counts.characters = (S.characters || []).length;
    A.bind(document);
  }

  function boot() {
    const A = window.Astral;
    const free = A.$("#tabFree"), premium = A.$("#tabPremium");
    if (free && premium) {
      free.addEventListener("click", () => { mode = "free"; free.classList.add("active"); premium.classList.remove("active"); render(); });
      premium.addEventListener("click", () => { mode = "premium"; premium.classList.add("active"); free.classList.remove("active"); render(); });
    }
    render();
    if (A.loadData) A.loadData().then(render).catch(() => {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

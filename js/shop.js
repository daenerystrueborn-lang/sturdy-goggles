/* ============================================================
   Astral of the Sun — Shop page
   ============================================================ */
(function () {
  "use strict";

  let activeCat = "";   // "" = all
  let query = "";

  function renderItems() {
    const A = window.Astral;
    const grid = A.$("#shopGrid");
    if (!grid) return;

    let items = A.data.shop || [];

    if (activeCat) items = items.filter((it) => (it.category || "items") === activeCat);
    if (query) {
      const q = query.toLowerCase();
      items = items.filter((it) => (it.name || "").toLowerCase().includes(q) || (it.desc || "").toLowerCase().includes(q));
    }

    if (!items.length) { A.empty(grid, "No items match"); return; }

    grid.innerHTML = "";
    grid.classList.add("shop-page-grid");

    items.forEach((it) => {
      const card = document.createElement("div");
      card.className = "shop-card";

      const icon = document.createElement("div");
      icon.className = "shop-icon";
      if (it.image) {
        const img = document.createElement("img");
        img.src = it.image; img.alt = it.name || "";
        icon.appendChild(img); icon.classList.add("has-img");
      }

      const name = document.createElement("div");
      name.className = "shop-name";
      name.textContent = it.name || "";

      const desc = document.createElement("div");
      desc.className = "shop-desc";
      desc.textContent = it.desc || "";

      const foot = document.createElement("div");
      foot.className = "shop-foot";

      const price = document.createElement("div");
      price.className = "shop-price";
      const amt = document.createElement("span");
      amt.textContent = it.price == null ? "" : String(it.price);
      price.appendChild(amt);
      if (it.currency !== "gems") {
        price.insertAdjacentHTML("afterbegin", A.coin(13));
      }

      const buy = document.createElement("button");
      buy.className = "btn btn-primary";
      buy.type = "button";
      buy.textContent = "Buy";

      foot.appendChild(price);
      foot.appendChild(buy);
      card.appendChild(icon); card.appendChild(name); card.appendChild(desc); card.appendChild(foot);
      grid.appendChild(card);
    });
  }

  function bindWallet() {
    const A = window.Astral;
    A.$$(".currency-bar [data-bind]").forEach((el) => {
      const v = A.lookup(el.getAttribute("data-bind"));
      el.textContent = (v === null || v === undefined || v === "") ? "" : String(v);
    });
  }

  function render() {
    const A = window.Astral;
    A.data.counts = A.data.counts || {};
    A.data.counts.shop = (A.data.shop || []).length;
    A.bind(document);
    bindWallet();
    renderItems();
  }

  function boot() {
    const A = window.Astral;

    // filters
    A.$$("#shopFilters .chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        A.$$("#shopFilters .chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        activeCat = chip.getAttribute("data-cat") || "";
        renderItems();
      });
    });

    // search
    const search = A.$("#shopSearch");
    if (search) {
      search.addEventListener("input", (e) => {
        query = (e.target.value || "").trim();
        renderItems();
      });
    }

    render();
    if (A.loadData) A.loadData().then(render).catch(() => {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

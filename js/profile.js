/* ============================================================
   Astral of the Sun — Profile page
   Includes the inventory overlay with drag & drop between
   inventory bag, the chest, and the PvP loadout.
   ============================================================ */
(function () {
  "use strict";

  function renderProfile() {
    const A = window.Astral, D = A.data;

    // banner + pfp (only when real URLs exist)
    A.image(A.$("#profileBanner"), D.profileBanner || D.banner, "Profile banner");
    A.image(A.$("#profilePfp"), D.player.avatar, "Profile picture");

    A.bind(document);

    // counts
    D.counts = D.counts || {};
    D.counts.inventory = (D.inventory || []).length;
    A.bind(document);
  }

  /* ── inventory overlay ── */

  function solid(img) {
    return img && img.length > 0;
  }

  function makeCell(item) {
    const A = window.Astral;
    const cell = document.createElement("div");
    cell.className = "inv-item img-ph";
    cell.setAttribute("draggable", "true");
    cell.dataset.id = item.id;
    cell.dataset.zone = item.zone || "inventory";

    if (item.image) {
      cell.style.backgroundImage = 'url("' + item.image + '")';
      cell.classList.add("has-img");
    }

    const name = document.createElement("div");
    name.className = "inv-name";
    name.textContent = item.name || "";
    cell.appendChild(name);

    cell.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", String(item.id));
      e.dataTransfer.effectAllowed = "move";
      cell.classList.add("dragging");
    });
    cell.addEventListener("dragend", () => cell.classList.remove("dragging"));
    return cell;
  }

  function renderInv() {
    const A = window.Astral, D = A.data;
    const bag = A.$("#invBag"), chest = A.$("#zoneChestItems"), pvp = A.$("#zonePvpItems");
    if (!bag) return;

    bag.innerHTML = ""; chest.innerHTML = ""; pvp.innerHTML = "";

    const inv = D.inventory || [];
    const vault = D.vault || [];
    const pvpList = D.pvp || [];

    if (!inv.length) { A.empty(bag, "Inventory is empty"); } else {
      bag.classList.remove("empty");
      inv.forEach((it) => bag.appendChild(makeCell(Object.assign({ zone: "inventory" }, it))));
    }

    (vault.length ? vault : []).forEach((it) => chest.appendChild(mini(it)));
    (pvpList.length ? pvpList : []).forEach((it) => pvp.appendChild(mini(it)));
  }

  function mini(item) {
    const m = document.createElement("div");
    m.className = "mini img-ph";
    m.title = item.name || "";
    if (item.image) {
      m.style.backgroundImage = 'url("' + item.image + '")';
      m.classList.add("has-img");
    }
    return m;
  }

  function initInventory() {
    const A = window.Astral;
    const overlay = A.$("#invOverlay");
    const openBtn = A.$("#openInventory");
    const closeBtn = A.$("#invClose");
    if (!overlay) return;

    openBtn && openBtn.addEventListener("click", () => {
      overlay.classList.add("open");
      renderInv();
      document.body.style.overflow = "hidden";
    });

    const close = () => {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    };
    closeBtn && closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    // drop zones
    A.$$(".inv-zone", overlay).forEach((zone) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        zone.classList.add("drag-over");
      });
      zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("drag-over");
        const id = e.dataTransfer.getData("text/plain");
        if (!id) return;
        moveItem(id, zone.getAttribute("data-zone"));
      });
    });

    // allow dropping back into the bag
    const bag = A.$("#invBag");
    if (bag) {
      bag.addEventListener("dragover", (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; });
      bag.addEventListener("drop", (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (!id) return;
        moveItem(id, "inventory");
      });
    }
  }

  function moveItem(id, targetZone) {
    const D = window.Astral.data;
    const names = ["inventory", "vault", "pvp"];
    D.inventory = D.inventory || [];
    D.vault = D.vault || [];
    D.pvp = D.pvp || [];

    let found = null;
    for (const key of names) {
      const arr = D[key];
      const idx = arr.findIndex((it) => String(it.id) === String(id));
      if (idx >= 0) { found = arr.splice(idx, 1)[0]; break; }
    }
    if (!found) return;

    // moving within the same zone is a no-op
    if (D[targetZone] && !D[targetZone].some((it) => String(it.id) === String(id))) {
      D[targetZone].push(found);
    }

    renderInv();
    renderProfile();
  }

  function boot() {
    renderProfile();
    initInventory();
    const A = window.Astral;
    if (A.loadData) A.loadData().then(() => { renderProfile(); }).catch(() => {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

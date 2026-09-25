/* ============================================================
   Astral of the Sun — Top-up page
   Top up Solars / Gems, buy Premium, claim server offers.
   Ships with NO fake data: package/offer lists render from
   Astral.data.topup (empty until a backend fills it), and every
   purchase goes through a request "process" (Astral.topup.create)
   that a backend completes via Astral.topup.onRequest.
   ============================================================ */
(function () {
  "use strict";

  const A = window.Astral;

  A.data.topup = A.data.topup || { solars: [], gems: [], premium: [], offers: [] };

  /* ── purchase process ── */
  A.topup = A.topup || {};
  A.topup.requests = A.topup.requests || [];
  A.topup.onRequest = A.topup.onRequest || null;   // fn(request) => Promise<{ok, reason?}>

  let seq = 0;
  let flashTimer = null;

  function createRequest(kind, payload) {
    seq += 1;
    const req = {
      id: "req-" + seq + "-" + Date.now().toString(36),
      kind: kind,                    // "solars" | "gems" | "premium" | "offer"
      payload: payload || {},
      status: "created",
      createdAt: Date.now(),
    };
    A.topup.requests.unshift(req);
    renderRequests();

    const finish = (result) => {
      if (result && result.ok) req.status = "fulfilled";
      else req.status = "failed" + (result && result.reason ? ": " + result.reason : "");
      renderRequests();
      return req;
    };

    if (typeof A.topup.onRequest === "function") {
      req.status = "processing";
      renderRequests();
      return Promise.resolve()
        .then(() => A.topup.onRequest(req))
        .then(finish, (err) => finish({ ok: false, reason: (err && err.message) || "error" }));
    }

    // no backend wired yet — park the request for the server to pick up
    req.status = "awaiting backend";
    renderRequests();
    return Promise.resolve(req);
  }
  A.topup.create = createRequest;

  /* ── rendering ── */
  let mode = "solars";

  function flash(msg) {
    const el = A.$("#topupFlash");
    if (!el) return;
    el.textContent = msg || "";
    if (flashTimer) clearTimeout(flashTimer);
    if (msg) flashTimer = setTimeout(() => { el.textContent = ""; }, 2600);
  }

  function pkgCard(it, kind, cta) {
    const card = document.createElement("div");
    card.className = "pkg-card";

    const title = document.createElement("div");
    title.className = "pkg-title";
    title.textContent = it.title || "";
    card.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "pkg-meta";
    meta.textContent = [it.amount != null ? String(it.amount) + " " + (kind === "gems" ? "Gems" : "Solars") : "", it.desc || ""].filter(Boolean).join(" · ");
    card.appendChild(meta);

    if (it.price != null && it.price !== "") {
      const price = document.createElement("div");
      price.className = "pkg-price";
      price.innerHTML = it.currency === "gems" ? A.gemIcon(13) : A.coin(13);
      const amt = document.createElement("span");
      amt.textContent = String(it.price);
      price.appendChild(amt);
      card.appendChild(price);
    }

    const btn = document.createElement("button");
    btn.className = "btn btn-primary";
    btn.type = "button";
    btn.textContent = cta || "Buy";
    btn.addEventListener("click", () => {
      createRequest(kind, { packageId: it.id != null ? it.id : null, amount: it.amount != null ? it.amount : null });
      flash("Request created for " + (it.title || kind) + ".");
    });
    card.appendChild(btn);
    return card;
  }

  function renderPackages() {
    const grid = A.$("#pkgGrid");
    if (!grid) return;
    const T = A.data.topup || {};
    const items = mode === "gems" ? (T.gems || []) : (T.solars || []);
    if (!items.length) {
      A.empty(grid, mode === "gems" ? "No Gems packages yet — connect a backend" : "No Solars packages yet — connect a backend");
      return;
    }
    grid.innerHTML = "";
    items.forEach((it) => grid.appendChild(pkgCard(it, mode, "Top up")));
  }

  function renderPremium() {
    const grid = A.$("#premiumGrid");
    if (!grid) return;
    const items = (A.data.topup && A.data.topup.premium) || [];
    if (!items.length) { A.empty(grid, "No Premium packs yet — connect a backend"); return; }
    grid.innerHTML = "";
    items.forEach((it) => grid.appendChild(pkgCard(it, "premium", "Buy")));
  }

  function renderOffers() {
    const grid = A.$("#offersGrid");
    if (!grid) return;
    const items = (A.data.topup && A.data.topup.offers) || [];
    A.data.counts = A.data.counts || {};
    A.data.counts.offers = items.length;
    if (!items.length) { A.empty(grid, "No server offers right now"); return; }
    grid.innerHTML = "";
    items.forEach((it) => grid.appendChild(pkgCard(it, "offer", "Claim")));
  }

  function payloadSummary(req) {
    const p = req.payload || {};
    const bits = [];
    if (p.amount != null) bits.push("amount " + p.amount);
    if (p.packageId != null) bits.push("pack " + p.packageId);
    return bits.join(" · ");
  }

  function renderRequests() {
    const list = A.$("#reqList");
    const metaEl = A.$("#reqMeta");
    if (!list) return;
    const reqs = A.topup.requests || [];
    if (metaEl) metaEl.textContent = reqs.length + (reqs.length === 1 ? " request" : " requests");
    if (!reqs.length) { A.empty(list, "No requests yet"); return; }
    list.innerHTML = "";
    reqs.forEach((req) => {
      const row = document.createElement("div");
      row.className = "req-row";

      const textWrap = document.createElement("div");
      textWrap.className = "req-text";
      textWrap.textContent = req.kind.charAt(0).toUpperCase() + req.kind.slice(1) + " top-up";
      const sub = document.createElement("div");
      sub.className = "req-sub";
      sub.textContent = [req.id, payloadSummary(req)].filter(Boolean).join(" · ");
      textWrap.appendChild(sub);

      const status = document.createElement("span");
      status.className = "req-status";
      if (req.status === "fulfilled") status.classList.add("ok");
      if (String(req.status).indexOf("failed") === 0) status.classList.add("err");
      status.textContent = req.status;

      row.appendChild(textWrap);
      row.appendChild(status);
      list.appendChild(row);
    });
  }

  /* ── boot ── */
  function boot() {
    // currency tabs
    const chips = A.$$("#curTabs .chip");
    const setMode = (m) => {
      mode = m;
      chips.forEach((c) => c.classList.toggle("active", c.getAttribute("data-cur") === m));
      renderPackages();
    };
    chips.forEach((chip) => {
      chip.addEventListener("click", () => setMode(chip.getAttribute("data-cur") || "solars"));
    });

    // arriving from Home with a currency preselected
    if (A.topupHint) { const hint = A.topupHint; A.topupHint = null; setMode(hint === "gems" ? "gems" : "solars"); }

    // manual top-up
    const createBtn = A.$("#createTopup");
    const amount = A.$("#topupAmount");
    if (createBtn && amount) {
      createBtn.addEventListener("click", () => {
        const n = parseInt(amount.value, 10);
        if (!n || n < 1) { flash("Enter an amount first."); return; }
        createRequest(mode, { amount: n });
        flash("Top-up request created — " + n + " " + (mode === "gems" ? "Gems" : "Solars") + ".");
        amount.value = "";
      });
    }

    // premium
    const premiumBtn = A.$("#buyPremium");
    if (premiumBtn) {
      premiumBtn.addEventListener("click", () => {
        createRequest("premium", {});
        flash("Premium purchase request created.");
      });
    }

    renderPackages();
    renderPremium();
    renderOffers();
    renderRequests();
    A.bind(document);

    if (A.loadData) A.loadData().then(() => { renderPackages(); renderPremium(); renderOffers(); A.bind(document); }).catch(() => {});
  }

  A.registerPage("topup", boot);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

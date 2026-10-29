(function () {
  "use strict";

  // ---------- Stockage ----------
  const K_ETUDES = "etudes_v1", K_REGL = "reglages_v1";
  function lire(k, def) {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; }
  }
  function ecrire(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { toast("Mémoire pleine : impossible d'enregistrer"); return false; }
  }
  let etudes = lire(K_ETUDES, []);
  let reglages = Object.assign({ societe: "ASCO Ascenseurs", technicien: "", logo: "" }, lire(K_REGL, {}));
  const sauverEtudes = () => ecrire(K_ETUDES, etudes);
  const sauverReglages = () => ecrire(K_REGL, reglages);

  // ---------- Outils ----------
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const auj = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const frDate = iso => iso ? iso.split("-").reverse().join("/") : "";
  const CHECK_SVG = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 2600);
  }

  let modalOnClose = null;
  function modal(titre, html, actions, onClose) {
    $("#modalTitle").textContent = titre;
    $("#modalBody").innerHTML = html;
    const zone = $("#modalActions"); zone.innerHTML = "";
    actions.forEach(a => {
      const b = document.createElement("button");
      b.className = "btn " + (a.cls || ""); b.textContent = a.txt;
      b.onclick = () => { if (a.fn && a.fn() === false) return; fermerModal(); };
      zone.appendChild(b);
    });
    modalOnClose = onClose || null;
    $("#modal").hidden = false;
  }
  function fermerModal() { $("#modal").hidden = true; if (modalOnClose) { const f = modalOnClose; modalOnClose = null; f(); } }
  function confirmer(titre, txt, ok, okTxt, cls) {
    modal(titre, "<p>" + esc(txt) + "</p>", [{ txt: "Annuler" }, { txt: okTxt || "OK", cls: cls || "primary", fn: ok }]);
  }

  // ---------- Modèle ----------
  function pointsVisibles(e) {
    const type = e.ident.type;
    const res = [];
    CHECKLIST.forEach(g => g.items.forEach(it => { if (!it.t || !type || it.t === type) res.push(it); }));
    return res;
  }
  function stats(e) {
    const vis = pointsVisibles(e);
    let fait = 0, nc = 0;
    vis.forEach(it => { const p = e.points[it.id]; if (p && p.e) { fait++; if (p.e === "NC") nc++; } });
    return { total: vis.length, fait, nc };
  }
  function nouvelleEtude() {
    const d = new Date();
    const num = "ES-" + auj().replace(/-/g, "") + "-" + String(d.getHours()).padStart(2, "0") + String(d.getMinutes()).padStart(2, "0");
    return {
      id: String(Date.now()), num, cree: Date.now(), maj: Date.now(),
      ident: { adresse: "", ville: "", client: "", numApp: "", marque: "", type: "", annee: "", erp: "",
               niveaux: "", charge: "", date: auj(), technicien: reglages.technicien || "" },
      points: {}, conclusion: "", signature: { nom: reglages.technicien || "", img: "" }
    };
  }

  // ---------- Navigation ----------
  let ecran = "liste", courante = null, onglet = "ident";

  function setTitre(t) { $("#title").textContent = t; }
  function afficher() {
    const enEtude = ecran === "etude";
    $("#btnBack").hidden = ecran === "liste";
    $("#btnSettings").hidden = ecran !== "liste";
    $("#tabs").hidden = !enEtude;
    $("#bottombar").hidden = !enEtude;
    document.querySelectorAll("#tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === onglet));
    if (ecran === "liste") vueListe();
    else if (ecran === "reglages") vueReglages();
    else {
      setTitre(courante.ident.adresse || "Nouvelle étude");
      if (onglet === "ident") vueIdent();
      else if (onglet === "check") vueControles();
      else vueSignature();
      majProgression();
    }
    window.scrollTo(0, 0);
  }
  function retour() {
    if (!$("#modal").hidden) { fermerModal(); return true; }
    if (ecran === "liste") return false;
    ecran = "liste"; courante = null; afficher(); return true;
  }
  window.onAndroidBack = retour;

  // ---------- Écran : liste ----------
  function vueListe() {
    setTitre("Études de sécurité");
    const v = $("#view");
    const tri = etudes.slice().sort((a, b) => b.maj - a.maj);
    let h = "";
    if (!tri.length) {
      h = '<div class="empty"><p style="font-size:17px;font-weight:600;color:#1c2430">Aucune étude pour le moment</p>' +
          "<p>Appuyez sur « Nouvelle étude » pour commencer.</p></div>";
    }
    tri.forEach(e => {
      const s = stats(e);
      let badge;
      if (s.fait < s.total) badge = '<span class="badge wip">' + s.fait + "/" + s.total + "</span>";
      else if (s.nc) badge = '<span class="badge ko">' + s.nc + " NC</span>";
      else badge = '<span class="badge ok">Conforme</span>';
      h += '<div class="card etude" data-id="' + e.id + '"><div class="info">' +
           '<div class="adr">' + esc(e.ident.adresse || "Adresse non renseignée") + "</div>" +
           '<div class="meta">' + esc([e.ident.ville, e.ident.numApp ? "App. " + e.ident.numApp : "", frDate(e.ident.date)].filter(Boolean).join(" · ")) + "</div>" +
           "</div>" + badge + "</div>";
    });
    h += '<div style="height:70px"></div><button class="fab" id="btnNew">+ Nouvelle étude</button>';
    v.innerHTML = h;
    $("#btnNew").onclick = () => {
      courante = nouvelleEtude(); etudes.push(courante); sauverEtudes();
      ecran = "etude"; onglet = "ident"; afficher();
    };
    v.querySelectorAll(".etude").forEach(el => {
      el.onclick = () => { courante = etudes.find(x => x.id === el.dataset.id); ecran = "etude"; onglet = "ident"; afficher(); };
    });
  }

  // ---------- Écran : réglages ----------
  function vueReglages() {
    setTitre("Réglages");
    $("#view").innerHTML =
      '<div class="card"><h2>Entreprise</h2>' +
      '<label class="field"><span>Nom de la société (en-tête du PDF)</span><input type="text" id="rSoc" value="' + esc(reglages.societe) + '"></label>' +
      '<label class="field"><span>Technicien par défaut</span><input type="text" id="rTech" value="' + esc(reglages.technicien) + '"></label></div>' +
      '<div class="card"><h2>Logo du rapport</h2>' +
      '<div class="logo-prev">' + (reglages.logo ? '<img src="' + reglages.logo + '" alt="Logo">' : '<span class="hint">Aucun logo choisi</span>') + "</div>" +
      '<div class="tout"><button class="btn primary" id="rLogo">Choisir un logo</button>' +
      (reglages.logo ? '<button class="btn danger" id="rLogoDel">Retirer</button>' : "") + "</div>" +
      '<p class="hint">Image PNG ou JPG depuis la galerie ou les fichiers du téléphone.</p></div>' +
      '<p class="hint" style="text-align:center">Études de sécurité ascenseurs · v1.0</p>';
    $("#rSoc").oninput = e => { reglages.societe = e.target.value; sauverReglages(); };
    $("#rTech").oninput = e => { reglages.technicien = e.target.value; sauverReglages(); };
    $("#rLogo").onclick = choisirLogo;
    if ($("#rLogoDel")) $("#rLogoDel").onclick = () => { reglages.logo = ""; sauverReglages(); vueReglages(); };
  }
  function choisirLogo() {
    const inp = $("#fileInput"); inp.value = "";
    inp.onchange = () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => {
        const max = 600, k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        reglages.logo = c.toDataURL("image/png");
        URL.revokeObjectURL(url);
        if (sauverReglages()) toast("Logo enregistré");
        vueReglages();
      };
      img.onerror = () => toast("Image illisible");
      img.src = url;
    };
    inp.click();
  }

  // ---------- Enregistrement automatique ----------
  let tSave = null;
  function modifie() {
    courante.maj = Date.now();
    clearTimeout(tSave); tSave = setTimeout(sauverEtudes, 300);
  }
  function lier(sel, obj, cle, apres) {
    const el = $(sel);
    el.addEventListener("input", () => { obj[cle] = el.value; modifie(); if (apres) apres(); });
  }

  // ---------- Onglet : appareil ----------
  function champ(id, label, val, type, extra) {
    return '<label class="field"><span>' + label + '</span><input type="' + (type || "text") + '" id="' + id +
      '" value="' + esc(val) + '"' + (extra || "") + "></label>";
  }
  function segment(id, opts, val) {
    return '<div class="seg" id="' + id + '">' + opts.map(o =>
      '<button type="button" data-v="' + o[0] + '" class="' + (val === o[0] ? "on" : "") + '">' + o[1] + "</button>").join("") + "</div>";
  }
  function vueIdent() {
    const i = courante.ident;
    $("#view").innerHTML =
      '<div class="card"><h2>Site</h2>' +
      champ("iAdr", "Adresse", i.adresse) + champ("iVille", "Code postal / ville", i.ville) +
      champ("iClient", "Client / syndic", i.client) +
      '<div class="row2">' + champ("iNum", "N° d'appareil", i.numApp) + champ("iDate", "Date de l'étude", i.date, "date") + "</div></div>" +
      '<div class="card"><h2>Appareil</h2>' +
      '<label class="field"><span>Type</span>' + segment("iType", [["elec", "Électrique"], ["hyd", "Hydraulique"]], i.type) + "</label>" +
      '<div class="row2">' + champ("iMarque", "Marque", i.marque) + champ("iAnnee", "Année de mise en service", i.annee, "text", ' inputmode="numeric"') + "</div>" +
      '<div class="row2">' + champ("iNiv", "Nombre de niveaux", i.niveaux, "text", ' inputmode="numeric"') + champ("iCharge", "Charge (kg)", i.charge, "text", ' inputmode="numeric"') + "</div>" +
      '<label class="field"><span>Établissement recevant du public (ERP)</span>' + segment("iErp", [["oui", "Oui"], ["non", "Non"]], i.erp) + "</label></div>" +
      '<div class="card"><h2>Intervenant</h2>' + champ("iTech", "Technicien", i.technicien) + "</div>" +
      '<button class="btn danger block" id="btnDel">Supprimer cette étude</button>';
    lier("#iAdr", i, "adresse", () => setTitre(i.adresse || "Nouvelle étude"));
    lier("#iVille", i, "ville"); lier("#iClient", i, "client"); lier("#iNum", i, "numApp");
    lier("#iDate", i, "date"); lier("#iMarque", i, "marque"); lier("#iAnnee", i, "annee");
    lier("#iNiv", i, "niveaux"); lier("#iCharge", i, "charge");
    lier("#iTech", i, "technicien", () => { if (!courante.signature.img) courante.signature.nom = i.technicien; });
    [["#iType", "type"], ["#iErp", "erp"]].forEach(([sel, cle]) => {
      $(sel).querySelectorAll("button").forEach(b => b.onclick = () => {
        i[cle] = i[cle] === b.dataset.v ? "" : b.dataset.v;
        $(sel).querySelectorAll("button").forEach(x => x.classList.toggle("on", x.dataset.v === i[cle]));
        modifie(); majProgression();
      });
    });
    $("#btnDel").onclick = () => confirmer("Supprimer l'étude ?", "Cette étude sera définitivement effacée du téléphone.", () => {
      etudes = etudes.filter(x => x.id !== courante.id); sauverEtudes();
      ecran = "liste"; courante = null; afficher();
    }, "Supprimer", "danger");
  }

  // ---------- Onglet : points de contrôle ----------
  function vueControles() {
    const type = courante.ident.type;
    let h = "";
    if (!type) h += '<div class="card hint">Indiquez le type d\'appareil (électrique / hydraulique) dans l\'onglet « Appareil » pour masquer les points qui ne le concernent pas.</div>';
    h += '<div class="tout"><button class="btn" id="toutC">Tout conforme</button><button class="btn" id="toutRaz">Tout effacer</button></div>';
    CHECKLIST.forEach(g => {
      const items = g.items.filter(it => !it.t || !type || it.t === type);
      if (!items.length) return;
      h += '<div class="groupe">' + esc(g.nom) + "</div>";
      items.forEach(it => {
        const p = courante.points[it.id] || {};
        h += '<div class="card point ' + (p.e || "") + '" data-id="' + it.id + '">' +
          '<div class="ref">' + esc(it.ref) + "</div>" +
          '<div class="txt">' + esc(it.txt) + "</div>" +
          '<div class="checks">' + ETATS.map(et =>
            '<div class="chk ' + et.v + (p.e === et.v ? " on" : "") + '" data-v="' + et.v + '" role="checkbox" aria-checked="' + (p.e === et.v) + '">' +
            '<span class="box">' + CHECK_SVG + "</span>" + esc(et.nom) + "</div>").join("") + "</div>" +
          '<textarea placeholder="' + (p.e === "NC" ? "Non-conformité constatée / travaux à prévoir" : "Observation (facultatif)") + '"' +
          (p.obs || p.e === "NC" ? "" : " hidden") + ">" + esc(p.obs || "") + "</textarea>" +
          "</div>";
      });
    });
    h += '<div class="card"><h2>Observations générales</h2><textarea id="concl" placeholder="Synthèse, préconisations…">' + esc(courante.conclusion) + "</textarea></div>";
    $("#view").innerHTML = h;

    $("#view").querySelectorAll(".point").forEach(card => {
      const id = card.dataset.id, ta = $("textarea", card);
      card.querySelectorAll(".chk").forEach(c => c.onclick = () => {
        const p = courante.points[id] || (courante.points[id] = { e: "", obs: "" });
        p.e = p.e === c.dataset.v ? "" : c.dataset.v;
        card.className = "card point " + p.e;
        card.querySelectorAll(".chk").forEach(x => {
          const on = x.dataset.v === p.e; x.classList.toggle("on", on); x.setAttribute("aria-checked", on);
        });
        ta.placeholder = p.e === "NC" ? "Non-conformité constatée / travaux à prévoir" : "Observation (facultatif)";
        if (p.e) ta.hidden = false;
        if (p.e === "NC" && !p.obs) ta.focus();
        modifie(); majProgression();
      });
      ta.addEventListener("input", () => {
        const p = courante.points[id] || (courante.points[id] = { e: "", obs: "" });
        p.obs = ta.value; modifie();
      });
    });
    lier("#concl", courante, "conclusion");
    $("#toutC").onclick = () => confirmer("Tout cocher « Conforme » ?", "Les points déjà renseignés ne seront pas modifiés.", () => {
      pointsVisibles(courante).forEach(it => {
        const p = courante.points[it.id] || (courante.points[it.id] = { e: "", obs: "" });
        if (!p.e) p.e = "C";
      });
      modifie(); vueControles(); majProgression();
    });
    $("#toutRaz").onclick = () => confirmer("Tout effacer ?", "Toutes les cases et observations de cette étude seront effacées.", () => {
      courante.points = {}; modifie(); vueControles(); majProgression();
    }, "Effacer", "danger");
  }

  // ---------- Onglet : signature ----------
  function vueSignature() {
    const s = courante.signature;
    $("#view").innerHTML =
      '<div class="card"><h2>Signature du technicien</h2>' +
      champ("sNom", "Nom du technicien", s.nom) +
      '<div class="sigbox" id="sigZone">' + (s.img ? '<img src="' + s.img + '" alt="Signature">' : "Appuyez ici pour signer") + "</div>" +
      (s.img ? '<div class="tout" style="margin-top:10px"><button class="btn" id="sigRefaire">Refaire</button><button class="btn danger" id="sigDel">Effacer</button></div>' : "") +
      "</div>" +
      '<p class="hint" style="text-align:center">La signature et la date de l\'étude figureront en bas du rapport PDF.</p>';
    lier("#sNom", s, "nom");
    $("#sigZone").onclick = signer;
    if ($("#sigRefaire")) $("#sigRefaire").onclick = signer;
    if ($("#sigDel")) $("#sigDel").onclick = () => { s.img = ""; modifie(); vueSignature(); majProgression(); };
  }
  function signer() {
    modal("Signature", '<canvas id="sigCanvas"></canvas><p class="hint">Signez avec le doigt dans le cadre.</p>', [
      { txt: "Effacer", fn: () => { pad.effacer(); return false; } },
      { txt: "Annuler" },
      { txt: "Valider", cls: "primary", fn: () => {
          if (pad.vide) { toast("Signez d'abord dans le cadre"); return false; }
          courante.signature.img = pad.image(); modifie(); vueSignature(); majProgression();
        } }
    ]);
    const pad = padSignature($("#sigCanvas"));
  }
  function padSignature(cv) {
    const r = window.devicePixelRatio || 1, rect = cv.getBoundingClientRect();
    cv.width = Math.round(rect.width * r); cv.height = Math.round(rect.height * r);
    const ctx = cv.getContext("2d");
    ctx.scale(r, r); ctx.lineWidth = 2.6; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#0b1f4a";
    const pad = { vide: true };
    let dessin = false, last = null;
    const pos = ev => { const b = cv.getBoundingClientRect(); return { x: ev.clientX - b.left, y: ev.clientY - b.top }; };
    cv.addEventListener("pointerdown", ev => { dessin = true; last = pos(ev); cv.setPointerCapture(ev.pointerId);
      ctx.beginPath(); ctx.arc(last.x, last.y, 1.2, 0, Math.PI * 2); ctx.fillStyle = ctx.strokeStyle; ctx.fill(); pad.vide = false; });
    cv.addEventListener("pointermove", ev => {
      if (!dessin) return;
      const p = pos(ev);
      ctx.beginPath(); ctx.moveTo(last.x, last.y);
      ctx.quadraticCurveTo(last.x, last.y, (last.x + p.x) / 2, (last.y + p.y) / 2);
      ctx.lineTo(p.x, p.y); ctx.stroke(); last = p;
    });
    const fin = () => { dessin = false; };
    cv.addEventListener("pointerup", fin); cv.addEventListener("pointercancel", fin);
    pad.effacer = () => { ctx.clearRect(0, 0, cv.width, cv.height); pad.vide = true; };
    pad.image = () => recadrer(cv);
    return pad;
  }
  // Recadre la signature sur la zone dessinée
  function recadrer(cv) {
    const ctx = cv.getContext("2d"), w = cv.width, h = cv.height, d = ctx.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (x1 <= x0) return cv.toDataURL("image/png");
    const m = 8; x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(w, x1 + m); y1 = Math.min(h, y1 + m);
    const c = document.createElement("canvas"); c.width = x1 - x0; c.height = y1 - y0;
    c.getContext("2d").drawImage(cv, x0, y0, c.width, c.height, 0, 0, c.width, c.height);
    return c.toDataURL("image/png");
  }

  // ---------- Progression & PDF ----------
  function majProgression() {
    if (!courante) return;
    const s = stats(courante);
    $("#progressFill").style.width = (s.total ? 100 * s.fait / s.total : 0) + "%";
    $("#progressText").textContent = s.fait + "/" + s.total + " points" + (s.nc ? " · " + s.nc + " non conforme" + (s.nc > 1 ? "s" : "") : "") +
      (courante.signature.img ? " · signé" : " · non signé");
  }
  function lancerPdf() {
    const s = stats(courante), manque = [];
    if (s.fait < s.total) manque.push((s.total - s.fait) + " point(s) non renseigné(s)");
    if (!courante.signature.img) manque.push("pas de signature");
    if (!courante.ident.adresse) manque.push("adresse manquante");
    const go = () => {
      $("#busy").hidden = false;
      setTimeout(() => {
        try { genererPdf(courante, reglages); }
        catch (e) { console.error(e); toast("Erreur PDF : " + e.message); }
        finally { $("#busy").hidden = true; }
      }, 60);
    };
    if (manque.length) confirmer("Étude incomplète", "Attention : " + manque.join(", ") + ". Générer le PDF quand même ?", go, "Générer");
    else go();
  }

  // ---------- Démarrage ----------
  $("#btnBack").onclick = retour;
  $("#btnSettings").onclick = () => { ecran = "reglages"; afficher(); };
  $("#btnPdf").onclick = lancerPdf;
  $("#modal").addEventListener("click", ev => { if (ev.target.id === "modal") fermerModal(); });
  document.querySelectorAll("#tabs button").forEach(b => b.onclick = () => { onglet = b.dataset.tab; afficher(); });
  window.addEventListener("pagehide", sauverEtudes);
  document.addEventListener("visibilitychange", () => { if (document.hidden) sauverEtudes(); });
  afficher();
})();

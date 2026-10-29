// Génération du PDF : fiche signalétique (page 1) + étude de sécurité spécifique (EDS)
window.genererPdf = function (e, regl) {
  "use strict";
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const W = 210, H = 297, M = 15, CW = W - 2 * M, BAS = H - 16;
  const BLEU = [13, 59, 102], GRIS = [110, 118, 130], TRAIT = [200, 206, 214], FOND = [236, 241, 247], NOIR = [28, 36, 48];
  const ROUGE = [200, 45, 40];
  const i = e.ident, type = i.type;
  const frDate = iso => iso ? iso.split("-").reverse().join("/") : "";
  let y = M;

  const police = (taille, gras, couleur) => {
    doc.setFont("helvetica", gras ? "bold" : "normal"); doc.setFontSize(taille);
    doc.setTextColor.apply(doc, couleur || NOIR);
  };
  const lignes = (txt, larg) => doc.splitTextToSize(String(txt || ""), larg);
  const hL = t => t * 0.3528 * 1.25;
  const saut = besoin => { if (y + besoin > BAS) { doc.addPage(); y = M; return true; } return false; };
  function image(data, x, yy, maxW, maxH) {
    try {
      const p = doc.getImageProperties(data);
      const k = Math.min(maxW / p.width, maxH / p.height);
      doc.addImage(data, p.fileType || "PNG", x, yy, p.width * k, p.height * k);
      return p.height * k;
    } catch (err) { return 0; }
  }
  function titre(t) {
    saut(14);
    police(10.5, true, BLEU); doc.text(t.toUpperCase(), M, y); y += 2;
    doc.setDrawColor.apply(doc, TRAIT); doc.setLineWidth(0.3); doc.line(M, y, W - M, y); y += 5;
  }
  function entetePage(gros, sous) {
    y = M;
    let hLogo = 0;
    if (regl.logo) hLogo = image(regl.logo, M, y, 48, 22);
    if (!hLogo) { police(14, true, BLEU); doc.text(regl.societe || "", M, y + 7); hLogo = 10; }
    police(16, true, BLEU); doc.text(gros, W - M, y + 6, { align: "right" });
    police(8.5, false, GRIS); doc.text(sous, W - M, y + 11.5, { align: "right" });
    police(9.5, true); doc.text("N° " + e.num + "   ·   " + frDate(i.date), W - M, y + 17, { align: "right" });
    y += Math.max(hLogo, 19) + 4;
    doc.setDrawColor.apply(doc, BLEU); doc.setLineWidth(0.6); doc.line(M, y, W - M, y);
    y += 6;
  }

  // Pictogramme d'avertissement (triangle jaune)
  function picto(x, yy, s, genre) {
    doc.setLineWidth(s * 0.06); doc.setDrawColor(20, 20, 20); doc.setFillColor(255, 204, 0);
    doc.triangle(x + s / 2, yy, x + s, yy + s * 0.88, x, yy + s * 0.88, "FD");
    doc.setFillColor(20, 20, 20);
    const cx = x + s / 2, base = yy + s * 0.88;
    if (genre === "electrique") {
      doc.triangle(cx + s * 0.08, yy + s * 0.25, cx - s * 0.13, base - s * 0.33, cx + s * 0.02, base - s * 0.36, "F");
      doc.triangle(cx - s * 0.05, base - s * 0.39, cx + s * 0.11, base - s * 0.42, cx - s * 0.06, base - s * 0.1, "F");
    } else {
      doc.roundedRect(cx - s * 0.045, yy + s * 0.3, s * 0.09, s * 0.32, s * 0.03, s * 0.03, "F");
      doc.circle(cx, base - s * 0.14, s * 0.055, "F");
    }
  }

  // ---------- Préparation des données ----------
  const visibles = g => g.items.filter(it => !it.t || !type || it.t === type);
  const opt = (it, v) => OPTS[it.o].find(o => o.v === v);
  const presents = [];
  CHECKLIST.forEach(g => visibles(g).forEach(it => {
    const p = e.points[it.id];
    if (it.o === "risque" && p && p.e === "P") presents.push({ g, it, p });
  }));

  // =========== PAGE 1 : FICHE SIGNALÉTIQUE ===========
  entetePage("FICHE SIGNALÉTIQUE", "Risques pour les intervenants – art. R4543-11 du Code du travail");
  doc.setFillColor.apply(doc, FOND); doc.roundedRect(M, y, CW, 16, 2, 2, "F");
  police(10, true); doc.text(lignes([i.adresse, i.ville].filter(Boolean).join(", ") || "—", CW - 8)[0], M + 4, y + 6.5);
  police(8.5, false, GRIS);
  doc.text(["Appareil " + (i.numApp || "—"), { elec: "électrique", hyd: "hydraulique" }[type] || "", i.marque,
            { haute: "machinerie haute", basse: "machinerie basse", laterale: "machinerie latérale", mrl: "sans local de machinerie" }[i.machinerie] || ""]
           .filter(Boolean).join("  ·  "), M + 4, y + 12);
  y += 22;

  police(11, true, ROUGE);
  doc.text(presents.length ? "RISQUES IDENTIFIÉS POUR L'INTERVENANT" : "AUCUN RISQUE PARTICULIER IDENTIFIÉ", M, y);
  y += 6;

  // Regroupement par pictogramme
  const parPicto = {};
  presents.forEach(r => { const k = r.it.p || "general"; (parPicto[k] = parPicto[k] || []).push(r); });
  Object.keys(PICTOS).filter(k => parPicto[k]).forEach(k => {
    const liste = parPicto[k];
    police(8.8, false);
    const blocs = liste.map(r => lignes(r.g.nom + " : " + r.it.txt, CW - 34));
    const nb = blocs.reduce((a, b) => a + b.length, 0);
    const h = Math.max(24, 9 + nb * hL(8.8) + liste.length * 1.2 + 3);
    saut(h + 3);
    doc.setDrawColor.apply(doc, TRAIT); doc.setLineWidth(0.3); doc.roundedRect(M, y, CW, h, 2, 2, "S");
    picto(M + 4, y + (h - 19) / 2, 20, k);
    police(10.5, true); doc.text(PICTOS[k].toUpperCase(), M + 30, y + 6.5);
    let yy = y + 11.5;
    blocs.forEach(b => { police(8.8, false); doc.text("•", M + 30, yy); doc.text(b, M + 33, yy); yy += b.length * hL(8.8) + 1.2; });
    y += h + 3;
  });

  saut(26); y += 2;
  doc.setFillColor(255, 248, 225); doc.setDrawColor(230, 180, 40); doc.setLineWidth(0.4);
  doc.roundedRect(M, y, CW, 20, 2, 2, "FD");
  police(9, true); doc.text("Les mesures de prévention et modes opératoires sont décrits dans l'étude de sécurité spécifique", M + 4, y + 7);
  police(9, false); doc.text("n° " + e.num + " du " + frDate(i.date) + ", réalisée par " + (e.signature.nom || i.technicien || "—") + (regl.societe ? " (" + regl.societe + ")" : "") + ".", M + 4, y + 12.5);
  police(8, false, GRIS); doc.text("Fiche à conserver en permanence dans le local des machines (art. R4543-11).", M + 4, y + 17);
  y += 24;

  // =========== ÉTUDE DE SÉCURITÉ SPÉCIFIQUE ===========
  doc.addPage();
  entetePage("ÉTUDE DE SÉCURITÉ SPÉCIFIQUE", "Interventions sur ascenseur – art. R4543-10 à R4543-13 du Code du travail");

  titre("Description de l'appareil");
  const col1 = [["Adresse", i.adresse], ["Ville", i.ville], ["Client / syndic", i.client], ["N° d'appareil", i.numApp], ["Accès bâtiment", i.acces]];
  const col2 = [["Entraînement", { elec: "Électrique", hyd: "Hydraulique" }[type]],
                ["Machinerie", { haute: "Haute", basse: "Basse", laterale: "Latérale", mrl: "Sans local (MRL)" }[i.machinerie]],
                ["Marque / année", [i.marque, i.annee].filter(Boolean).join(" · ")],
                ["Niveaux / charge", [i.niveaux ? i.niveaux + " niv." : "", i.charge ? i.charge + " kg" : "", i.vitesse ? i.vitesse + " m/s" : ""].filter(Boolean).join(" · ")],
                ["Manœuvre", i.manoeuvre]];
  const demi = CW / 2, lab = 29;
  const ecrireCol = (rows, x, yy) => {
    rows.forEach(([l, v]) => {
      police(8.5, false, GRIS); doc.text(l, x, yy);
      police(9.3, true);
      const ls = lignes(v || "—", demi - lab - 4);
      doc.text(ls, x + lab, yy);
      yy += ls.length * hL(9.3) + 1.2;
    });
    return yy;
  };
  y = Math.max(ecrireCol(col1, M, y), ecrireCol(col2, M + demi, y)) + 4;

  // Synthèse
  let nRisques = presents.length, nManque = 0, nVide = 0, nTot = 0;
  CHECKLIST.forEach(g => visibles(g).forEach(it => {
    nTot++;
    const p = e.points[it.id]; const o = p && p.e && opt(it, p.e);
    if (!o) nVide++; else if (o.alerte && it.o !== "risque") nManque++;
  }));
  titre("Synthèse");
  const cases = [["Risques identifiés", nRisques, ROUGE], ["Équipements / documents manquants", nManque, [215, 130, 15]], ["Points vérifiés", nTot - nVide + " / " + nTot, [34, 139, 64]]];
  const lc = (CW - 8) / 3;
  cases.forEach(([l, n, c], k) => {
    const x = M + k * (lc + 4);
    doc.setFillColor.apply(doc, FOND); doc.roundedRect(x, y, lc, 15, 2, 2, "F");
    doc.setFillColor.apply(doc, c); doc.rect(x, y, 1.6, 15, "F");
    police(14, true, c); doc.text(String(n), x + 5, y + 9.8);
    const wn = doc.getTextWidth(String(n));
    police(7.8, false, GRIS); doc.text(lignes(l, lc - wn - 11), x + 8 + wn, y + 6.8);
  });
  y += 21;

  // Tableaux par rubrique
  const cPt = 82, cRes = 24, cObs = CW - cPt - cRes;
  const xs = { pt: M, res: M + cPt, obs: M + cPt + cRes };
  function enteteTab(colObs) {
    doc.setFillColor.apply(doc, BLEU); doc.rect(M, y, CW, 7, "F");
    police(8, true, [255, 255, 255]);
    doc.text("Point examiné", xs.pt + 1.5, y + 4.7);
    doc.text("Constat", xs.res + cRes / 2, y + 4.7, { align: "center" });
    doc.text(colObs, xs.obs + 1.5, y + 4.7);
    y += 7;
  }
  const T = 8.2, LH = hL(T);
  CHECKLIST.forEach(g => {
    const items = visibles(g);
    if (!items.length) return;
    const colObs = g.items[0].o === "risque" || g.id === "acm" ? "Mesures de prévention / observations" : "Observations";
    saut(30);
    titre(g.nom);
    enteteTab(colObs);
    items.forEach(it => {
      const p = e.points[it.id] || {};
      const o = p.e && opt(it, p.e);
      police(T, false);
      const lp = lignes(it.txt, cPt - 3), lo = lignes(p.obs || "", cObs - 3);
      const lr = lignes(o ? o.court : "—", cRes - 2);
      const hRow = Math.max(lp.length, lo.length, lr.length, 1) * LH + 3.2;
      if (saut(hRow)) enteteTab(colObs);
      if (o && o.alerte) { doc.setFillColor(it.o === "risque" ? 253 : 255, it.o === "risque" ? 238 : 246, it.o === "risque" ? 237 : 230); doc.rect(M, y, CW, hRow, "F"); }
      police(T, false); doc.text(lp, xs.pt + 1.5, y + 2 + LH * 0.75);
      police(T, true, o ? o.rgb : GRIS); doc.text(lr, xs.res + cRes / 2, y + 2 + LH * 0.75, { align: "center" });
      police(T, false); doc.text(lo, xs.obs + 1.5, y + 2 + LH * 0.75);
      doc.setDrawColor.apply(doc, TRAIT); doc.setLineWidth(0.2);
      doc.line(M, y + hRow, W - M, y + hRow);
      [xs.res, xs.obs].forEach(x => doc.line(x, y, x, y + hRow));
      y += hRow;
    });
    y += 6;
  });

  if ((e.conclusion || "").trim()) {
    titre("Observations / modes opératoires particuliers");
    police(9.3, false);
    lignes(e.conclusion, CW).forEach(l => { saut(hL(9.3)); doc.text(l, M, y); y += hL(9.3); });
    y += 5;
  }

  // Signature
  if (y + 50 > BAS) { doc.addPage(); y = M; }
  titre("Établie par");
  const s = e.signature || {};
  const bx = W - M - 85;
  police(9.3, false);
  doc.text("Fait le " + (frDate(i.date) || "—"), M, y + 4);
  if (regl.societe) doc.text("Entreprise intervenante : " + regl.societe, M, y + 10);
  police(8.5, false, GRIS); doc.text("Le technicien", bx, y + 4);
  police(10, true); doc.text(s.nom || i.technicien || "", bx, y + 9.5);
  doc.setDrawColor.apply(doc, TRAIT); doc.setLineWidth(0.3); doc.roundedRect(bx, y + 12, 85, 30, 2, 2, "S");
  if (s.img) image(s.img, bx + 3, y + 14, 79, 26);

  // Pieds de page
  const n = doc.getNumberOfPages();
  for (let k = 1; k <= n; k++) {
    doc.setPage(k);
    doc.setDrawColor.apply(doc, TRAIT); doc.setLineWidth(0.3); doc.line(M, H - 11, W - M, H - 11);
    police(7.5, false, GRIS);
    doc.text([regl.societe, e.num, i.adresse].filter(Boolean).join("  ·  "), M, H - 7);
    doc.text("Page " + k + " / " + n, W - M, H - 7, { align: "right" });
  }

  const nettoie = t => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40);
  const nom = ["EDS", nettoie(i.adresse), nettoie(i.numApp), (i.date || "").replace(/-/g, "")].filter(Boolean).join("_") + ".pdf";
  if (window.AndroidBridge && window.AndroidBridge.sharePdf) {
    window.AndroidBridge.sharePdf(doc.output("datauristring").split(",")[1], nom);
  } else {
    doc.save(nom);
  }
  return nom;
};

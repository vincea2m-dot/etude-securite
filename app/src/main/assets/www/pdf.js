// Génération du rapport PDF d'étude de sécurité (jsPDF)
window.genererPdf = function (e, regl) {
  "use strict";
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const W = 210, H = 297, M = 15, CW = W - 2 * M, BAS = H - 16;
  const BLEU = [13, 59, 102], GRIS = [110, 118, 130], TRAIT = [200, 206, 214], FOND = [236, 241, 247];
  const i = e.ident;
  const frDate = iso => iso ? iso.split("-").reverse().join("/") : "";
  const type = i.type;
  let y = M;

  const police = (taille, gras, couleur) => {
    doc.setFont("helvetica", gras ? "bold" : "normal"); doc.setFontSize(taille);
    doc.setTextColor.apply(doc, couleur || [28, 36, 48]);
  };
  const lignes = (txt, larg) => doc.splitTextToSize(String(txt || ""), larg);
  const hLigne = taille => taille * 0.3528 * 1.25; // hauteur d'une ligne en mm
  const saut = besoin => { if (y + besoin > BAS) { doc.addPage(); y = M; return true; } return false; };

  function image(data, x, yy, maxW, maxH, alignDroite) {
    try {
      const p = doc.getImageProperties(data);
      const k = Math.min(maxW / p.width, maxH / p.height);
      const w = p.width * k, h = p.height * k;
      doc.addImage(data, p.fileType || "PNG", alignDroite ? x + maxW - w : x, yy, w, h);
      return h;
    } catch (err) { return 0; }
  }

  // ---------- En-tête ----------
  let hLogo = 0;
  if (regl.logo) hLogo = image(regl.logo, M, y, 48, 22);
  if (!hLogo) { police(14, true, BLEU); doc.text(regl.societe || "", M, y + 7); hLogo = 10; }
  police(17, true, BLEU);
  doc.text("ÉTUDE DE SÉCURITÉ", W - M, y + 6, { align: "right" });
  police(9, false, GRIS);
  doc.text("Ascenseur – dispositifs de l'article R134-3 du CCH", W - M, y + 11.5, { align: "right" });
  police(9.5, true);
  doc.text("N° " + e.num + "   ·   " + frDate(i.date), W - M, y + 17, { align: "right" });
  y += Math.max(hLogo, 19) + 4;
  doc.setDrawColor.apply(doc, BLEU); doc.setLineWidth(0.6); doc.line(M, y, W - M, y);
  y += 6;

  // ---------- Identification ----------
  function titre(t) {
    saut(14);
    police(10.5, true, BLEU); doc.text(t.toUpperCase(), M, y); y += 2;
    doc.setDrawColor.apply(doc, TRAIT); doc.setLineWidth(0.3); doc.line(M, y, W - M, y); y += 5;
  }
  titre("Identification de l'appareil");
  const typeTxt = { elec: "Électrique", hyd: "Hydraulique" }[type] || "";
  const erpTxt = { oui: "Oui", non: "Non" }[i.erp] || "";
  const col1 = [["Adresse", i.adresse], ["Ville", i.ville], ["Client / syndic", i.client], ["N° d'appareil", i.numApp], ["Technicien", i.technicien]];
  const col2 = [["Type", typeTxt], ["Marque", i.marque], ["Mise en service", i.annee], ["Niveaux / charge", [i.niveaux ? i.niveaux + " niv." : "", i.charge ? i.charge + " kg" : ""].filter(Boolean).join(" · ")], ["ERP", erpTxt]];
  const demi = CW / 2, lab = 30;
  let y1 = y, y2 = y;
  const ecrireCol = (rows, x, yy) => {
    rows.forEach(([l, v]) => {
      police(8.5, false, GRIS); doc.text(l, x, yy);
      police(9.5, true);
      const ls = lignes(v || "—", demi - lab - 4);
      doc.text(ls, x + lab, yy);
      yy += Math.max(1, ls.length) * hLigne(9.5) + 1.2;
    });
    return yy;
  };
  y1 = ecrireCol(col1, M, y); y2 = ecrireCol(col2, M + demi, y);
  y = Math.max(y1, y2) + 3;

  // ---------- Synthèse ----------
  const vis = [];
  CHECKLIST.forEach(g => g.items.forEach(it => { if (!it.t || !type || it.t === type) vis.push(it); }));
  let nC = 0, nNC = 0, nSO = 0, nVide = 0;
  vis.forEach(it => {
    const v = (e.points[it.id] || {}).e;
    if (v === "C") nC++; else if (v === "NC") nNC++; else if (v === "SO") nSO++; else nVide++;
  });
  titre("Synthèse");
  const cases = [["Conformes", nC, [34, 139, 64]], ["Non conformes", nNC, [200, 45, 40]], ["Sans objet", nSO, [130, 138, 146]]];
  if (nVide) cases.push(["Non renseignés", nVide, [190, 130, 20]]);
  const lc = (CW - (cases.length - 1) * 4) / cases.length;
  cases.forEach(([l, n, c], k) => {
    const x = M + k * (lc + 4);
    doc.setFillColor.apply(doc, FOND); doc.roundedRect(x, y, lc, 15, 2, 2, "F");
    doc.setFillColor.apply(doc, c); doc.rect(x, y, 1.6, 15, "F");
    police(15, true, c); doc.text(String(n), x + 6, y + 9.5);
    police(8.5, false, GRIS); doc.text(l, x + 6 + doc.getStringUnitWidth(String(n)) * 15 * 0.3528 + 3, y + 9.3);
  });
  y += 20;
  police(10, true, nNC ? [200, 45, 40] : [34, 139, 64]);
  const verdict = nNC
    ? nNC + " dispositif" + (nNC > 1 ? "s" : "") + " non conforme" + (nNC > 1 ? "s" : "") + " : travaux de mise en sécurité à prévoir."
    : (nVide ? "Aucune non-conformité relevée sur les points renseignés." : "Aucune non-conformité relevée.");
  doc.text(lignes(verdict, CW), M, y); y += 8;

  // ---------- Tableau des points ----------
  titre("Points de contrôle");
  const cRef = 13, cDisp = 78, cBox = 11, cObs = CW - cRef - cDisp - 3 * cBox;
  const xs = { ref: M, disp: M + cRef, c: M + cRef + cDisp, nc: M + cRef + cDisp + cBox, so: M + cRef + cDisp + 2 * cBox, obs: M + cRef + cDisp + 3 * cBox };
  function entete() {
    doc.setFillColor.apply(doc, BLEU); doc.rect(M, y, CW, 7, "F");
    police(8, true, [255, 255, 255]);
    doc.text("Réf.", xs.ref + 1.5, y + 4.7);
    doc.text("Dispositif", xs.disp + 1.5, y + 4.7);
    doc.text("C", xs.c + cBox / 2, y + 4.7, { align: "center" });
    doc.text("NC", xs.nc + cBox / 2, y + 4.7, { align: "center" });
    doc.text("SO", xs.so + cBox / 2, y + 4.7, { align: "center" });
    doc.text("Observations", xs.obs + 1.5, y + 4.7);
    y += 7;
  }
  function caseACocher(cx, cy, coche, couleur) {
    const s = 3.8, x = cx - s / 2, yy = cy - s / 2;
    doc.setLineWidth(0.3);
    if (coche) {
      doc.setFillColor.apply(doc, couleur); doc.setDrawColor.apply(doc, couleur); doc.rect(x, yy, s, s, "FD");
      doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.55);
      doc.line(x + 0.8, yy + 2.0, x + 1.6, yy + 2.9); doc.line(x + 1.6, yy + 2.9, x + 3.1, yy + 0.9);
    } else {
      doc.setDrawColor(150, 156, 165); doc.rect(x, yy, s, s, "S");
    }
  }
  saut(30); entete();
  const T = 8.3, LH = hLigne(T);
  CHECKLIST.forEach(g => {
    const items = g.items.filter(it => !it.t || !type || it.t === type);
    if (!items.length) return;
    if (saut(14)) entete();
    doc.setFillColor.apply(doc, FOND); doc.rect(M, y, CW, 6, "F");
    police(8.3, true, BLEU); doc.text(g.nom, M + 1.5, y + 4.2); y += 6;
    items.forEach(it => {
      const p = e.points[it.id] || {};
      police(T, false);
      const ld = lignes(it.txt, cDisp - 3);
      const lo = lignes(p.obs || "", cObs - 3);
      const hRow = Math.max(ld.length, lo.length, 1) * LH + 3.2;
      if (saut(hRow)) entete();
      if (p.e === "NC") { doc.setFillColor(253, 238, 237); doc.rect(M, y, CW, hRow, "F"); }
      police(T, true, GRIS); doc.text(it.ref, xs.ref + 1.5, y + 2 + LH * 0.75);
      police(T, false); doc.text(ld, xs.disp + 1.5, y + 2 + LH * 0.75);
      police(T, false, p.e === "NC" ? [160, 30, 25] : [28, 36, 48]); doc.text(lo, xs.obs + 1.5, y + 2 + LH * 0.75);
      const cy = y + hRow / 2;
      caseACocher(xs.c + cBox / 2, cy, p.e === "C", [34, 139, 64]);
      caseACocher(xs.nc + cBox / 2, cy, p.e === "NC", [200, 45, 40]);
      caseACocher(xs.so + cBox / 2, cy, p.e === "SO", [130, 138, 146]);
      doc.setDrawColor.apply(doc, TRAIT); doc.setLineWidth(0.2);
      doc.line(M, y + hRow, W - M, y + hRow);
      [xs.disp, xs.c, xs.nc, xs.so, xs.obs].forEach(x => doc.line(x, y, x, y + hRow));
      y += hRow;
    });
  });
  police(7.5, false, GRIS);
  y += 4; saut(6);
  doc.text("C = conforme   ·   NC = non conforme   ·   SO = sans objet", M, y); y += 7;

  // ---------- Observations générales ----------
  if ((e.conclusion || "").trim()) {
    titre("Observations générales");
    police(9.5, false);
    lignes(e.conclusion, CW).forEach(l => { saut(hLigne(9.5)); doc.text(l, M, y); y += hLigne(9.5); });
    y += 5;
  }

  // ---------- Signature ----------
  if (y + 50 > BAS) { doc.addPage(); y = M; }
  titre("Signature");
  const s = e.signature || {};
  const bx = W - M - 85;
  police(9.5, false);
  doc.text("Fait le " + (frDate(i.date) || "—"), M, y + 4);
  if (i.ville) doc.text("Ville : " + i.ville, M, y + 10);
  police(8.5, false, GRIS); doc.text("Le technicien", bx, y + 4);
  police(10, true); doc.text(s.nom || i.technicien || "", bx, y + 9.5);
  doc.setDrawColor.apply(doc, TRAIT); doc.setLineWidth(0.3); doc.roundedRect(bx, y + 12, 85, 30, 2, 2, "S");
  if (s.img) image(s.img, bx + 3, y + 14, 79, 26);
  y += 46;

  // ---------- Pieds de page ----------
  const n = doc.getNumberOfPages();
  for (let k = 1; k <= n; k++) {
    doc.setPage(k);
    doc.setDrawColor.apply(doc, TRAIT); doc.setLineWidth(0.3); doc.line(M, H - 11, W - M, H - 11);
    police(7.5, false, GRIS);
    doc.text([regl.societe, "Étude de sécurité " + e.num].filter(Boolean).join("  ·  "), M, H - 7);
    doc.text("Page " + k + " / " + n, W - M, H - 7, { align: "right" });
  }

  // ---------- Sortie ----------
  const nettoie = t => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40);
  const nom = ["Etude_securite", nettoie(i.adresse), (i.date || "").replace(/-/g, "")].filter(Boolean).join("_") + ".pdf";
  if (window.AndroidBridge && window.AndroidBridge.sharePdf) {
    const b64 = doc.output("datauristring").split(",")[1];
    window.AndroidBridge.sharePdf(b64, nom);
  } else {
    doc.save(nom);
  }
  return nom;
};

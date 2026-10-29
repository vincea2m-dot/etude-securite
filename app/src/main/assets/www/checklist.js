// EDS – Étude De Sécurité spécifique (Code du travail, art. R4543-10 à R4543-13)
// o : type de réponse (voir OPTS) · p : pictogramme de la fiche signalétique · m : mesure de prévention type
// t : "elec" = électrique seulement, "hyd" = hydraulique seulement

const R = [200, 45, 40], V = [34, 139, 64], G = [130, 138, 146], O = [215, 130, 15], B = [13, 59, 102];

window.OPTS = {
  risque: [
    { v: "P", nom: "Risque présent", court: "PRÉSENT", rgb: R, alerte: true },
    { v: "A", nom: "Absent", court: "Absent", rgb: V },
    { v: "SO", nom: "Sans objet", court: "S.O.", rgb: G }
  ],
  equip: [
    { v: "O", nom: "Présent", court: "Présent", rgb: V },
    { v: "N", nom: "Absent", court: "ABSENT", rgb: O, alerte: true },
    { v: "SO", nom: "Sans objet", court: "S.O.", rgb: G }
  ],
  doc: [
    { v: "C", nom: "Complète", court: "Complète", rgb: V },
    { v: "I", nom: "Incomplète", court: "INCOMPLÈTE", rgb: O, alerte: true },
    { v: "A", nom: "Absente", court: "ABSENTE", rgb: R, alerte: true }
  ],
  acces: [
    { v: "PP", nom: "Plain-pied", court: "Plain-pied", rgb: B },
    { v: "ESC", nom: "Escalier", court: "Escalier", rgb: B },
    { v: "ECF", nom: "Échelle fixe", court: "Échelle fixe", rgb: B },
    { v: "ECM", nom: "Échelle mobile", court: "Échelle mobile", rgb: B },
    { v: "TRA", nom: "Trappe", court: "Trappe", rgb: B },
    { v: "TER", nom: "Terrasse / toiture", court: "Terrasse", rgb: B }
  ]
};

window.PICTOS = {
  chute: "Chute de hauteur",
  ecrasement: "Écrasement / cisaillement",
  electrique: "Risque électrique",
  happement: "Happement / entraînement",
  heurt: "Heurt à la tête",
  glissade: "Glissade / chute de plain-pied",
  eclairage: "Éclairage insuffisant",
  manutention: "Manutention",
  amiante: "Amiante",
  isole: "Travailleur isolé",
  coactivite: "Présence du public",
  general: "Danger"
};

window.CHECKLIST = [
  {
    id: "acm", nom: "Accès à la machinerie / local des poulies", items: [
      { id: "acm_moyen", txt: "Moyen d'accès au local des machines", o: "acces" },
      { id: "acm_chute", txt: "Chute de hauteur lors de l'accès (échelle, trappe, terrasse sans protection)", o: "risque", p: "chute",
        m: "Utiliser les protections collectives existantes ; à défaut, harnais antichute sur point d'ancrage. Mains libres lors de la montée." },
      { id: "acm_eclair", txt: "Éclairage du cheminement d'accès insuffisant", o: "risque", p: "eclairage",
        m: "Se munir d'une lampe frontale ou d'une baladeuse." },
      { id: "acm_porte", txt: "Porte du local non verrouillable ou non signalée", o: "risque", p: "general",
        m: "Refermer à clé pendant et après l'intervention. Demander la mise en conformité au propriétaire." },
      { id: "acm_tiers", txt: "Cheminement par des parties privatives ou occupées", o: "risque", p: "coactivite",
        m: "Prévenir le gardien / l'occupant avant l'intervention." }
    ]
  },
  {
    id: "mach", nom: "Machinerie", items: [
      { id: "mach_heurt", txt: "Hauteur libre insuffisante, poutres ou obstacles en hauteur", o: "risque", p: "heurt",
        m: "Port du casque obligatoire dans le local." },
      { id: "mach_tremie", txt: "Trémies ou ouvertures au sol non protégées", o: "risque", p: "chute",
        m: "Baliser ou obturer les trémies avant toute intervention." },
      { id: "mach_happ", txt: "Organes mobiles non protégés (poulies, câbles, courroies, volant)", o: "risque", p: "happement", t: "elec",
        m: "Consigner l'appareil avant toute intervention à proximité. Pas de vêtements amples ni bijoux." },
      { id: "mach_elec", txt: "Pièces nues sous tension accessibles (armoire, tableau d'arrivée)", o: "risque", p: "electrique",
        m: "Intervention réservée au personnel habilité. Consignation électrique, EPI adaptés (gants, écran facial)." },
      { id: "mach_consign", txt: "Consignation impossible (sectionneur absent ou non cadenassable)", o: "risque", p: "electrique",
        m: "Consigner en amont (tableau général) et signaler. Demander la pose d'un sectionneur cadenassable." },
      { id: "mach_glis", txt: "Sol glissant ou encombré (huile, graisse, stockage)", o: "risque", p: "glissade",
        m: "Nettoyer / dégager avant l'intervention. Chaussures de sécurité antidérapantes." },
      { id: "mach_eclair", txt: "Éclairage fixe insuffisant", o: "risque", p: "eclairage",
        m: "Compléter par un éclairage portatif." },
      { id: "mach_temp", txt: "Ventilation insuffisante / température excessive", o: "risque", p: "general",
        m: "Aérer le local, limiter la durée d'exposition, hydratation." }
    ]
  },
  {
    id: "toit", nom: "Toit de cabine", items: [
      { id: "toit_gc", txt: "Absence de garde-corps (chute dans la gaine)", o: "risque", p: "chute",
        m: "Harnais antichute relié à un point d'ancrage hors cabine, ou rester au centre du toit." },
      { id: "toit_insp", txt: "Absence de stop ou de boîte d'inspection accessible depuis le palier", o: "risque", p: "ecrasement",
        m: "Mettre l'appareil à l'arrêt depuis la machinerie avant de monter sur le toit." },
      { id: "toit_haut", txt: "Espace libre insuffisant en haut de gaine (écrasement)", o: "risque", p: "ecrasement",
        m: "Se déplacer uniquement en inspection, ne jamais desservir le niveau extrême haut. Pose d'une cale si nécessaire." },
      { id: "toit_cp", txt: "Contrepoids croisant le toit sans écran de protection", o: "risque", p: "ecrasement", t: "elec",
        m: "Rester hors de la zone de croisement, se tenir au centre du toit pendant les déplacements." },
      { id: "toit_glis", txt: "Toit encombré, glissant ou non résistant", o: "risque", p: "glissade",
        m: "Nettoyer le toit, ne marcher que sur les zones résistantes." }
    ]
  },
  {
    id: "gaine", nom: "Gaine", items: [
      { id: "gaine_eclair", txt: "Éclairage de gaine absent ou insuffisant", o: "risque", p: "eclairage",
        m: "Lampe frontale obligatoire. Signaler au propriétaire." },
      { id: "gaine_ajour", txt: "Gaine ajourée / accessible aux tiers (chute d'objets, contact)", o: "risque", p: "coactivite",
        m: "Baliser les paliers concernés, ne rien laisser sur le toit de cabine." },
      { id: "gaine_mult", txt: "Gaine commune à plusieurs appareils sans séparation", o: "risque", p: "ecrasement",
        m: "Consigner ou mettre en inspection l'appareil voisin pendant l'intervention." },
      { id: "gaine_derive", txt: "Risque de dérive de la cabine", o: "risque", p: "ecrasement", t: "hyd",
        m: "Caler la cabine avant toute intervention sous la cabine ou en cuvette." }
    ]
  },
  {
    id: "cuv", nom: "Cuvette", items: [
      { id: "cuv_acces", txt: "Accès en cuvette difficile (pas d'échelle, grande profondeur)", o: "risque", p: "chute",
        m: "Utiliser une échelle adaptée et stable. Descente mains libres." },
      { id: "cuv_stop", txt: "Stop cuvette absent ou inaccessible depuis le palier", o: "risque", p: "ecrasement",
        m: "Consigner l'appareil en machinerie avant de descendre en cuvette." },
      { id: "cuv_refuge", txt: "Espace de refuge insuffisant (écrasement sous la cabine)", o: "risque", p: "ecrasement",
        m: "Immobiliser la cabine en haut de course et consigner avant d'entrer en cuvette." },
      { id: "cuv_eau", txt: "Présence d'eau ou d'humidité", o: "risque", p: "electrique",
        m: "Assécher ou consigner l'éclairage / les prises de cuvette. Bottes de sécurité." },
      { id: "cuv_eclair", txt: "Absence d'éclairage en cuvette", o: "risque", p: "eclairage",
        m: "Éclairage portatif obligatoire." }
    ]
  },
  {
    id: "pal", nom: "Paliers / portes", items: [
      { id: "pal_ouvert", txt: "Porte palière ouverte sur la gaine pendant l'intervention (chute)", o: "risque", p: "chute",
        m: "Baliser le palier, ne jamais laisser une porte palière ouverte sans surveillance." },
      { id: "pal_public", txt: "Passage fréquent du public / co-activité", o: "risque", p: "coactivite",
        m: "Balisage et affichage « appareil en maintenance » à tous les niveaux." },
      { id: "pal_deverr", txt: "Déverrouillage de secours difficile ou non sécurisé", o: "risque", p: "chute",
        m: "Utiliser la clé de déverrouillage adaptée, s'assurer de la position de la cabine avant ouverture." }
    ]
  },
  {
    id: "autre", nom: "Autres risques", items: [
      { id: "aut_amiante", txt: "Présence d'amiante possible (installation antérieure à 1997)", o: "risque", p: "amiante",
        m: "Consulter le DTA avant intervention. Aucune intervention sur matériaux suspects sans mode opératoire amiante." },
      { id: "aut_isole", txt: "Travail isolé", o: "risque", p: "isole",
        m: "Dispositif d'alarme travailleur isolé (PTI) ou intervention en binôme pour les opérations à risque." },
      { id: "aut_charge", txt: "Manutention de charges lourdes (moteur, poulies, câbles)", o: "risque", p: "manutention",
        m: "Utiliser les moyens de levage, intervention à deux, gestes et postures." }
    ]
  },
  {
    id: "manu", nom: "Dispositifs d'aide à la manutention", items: [
      { id: "manu_crochet", txt: "Crochet / anneau de levage en machinerie (charge indiquée)", o: "equip" },
      { id: "manu_poutre", txt: "Poutre ou point de levage en tête de gaine", o: "equip" },
      { id: "manu_acces", txt: "Moyen de manutention pour l'accès au local (monte-charge, palan)", o: "equip" }
    ]
  },
  {
    id: "doc", nom: "Documentation technique", items: [
      { id: "doc_schemas", txt: "Schémas électriques", o: "doc" },
      { id: "doc_notice", txt: "Notice / consignes de manœuvre de secours", o: "doc" },
      { id: "doc_carnet", txt: "Carnet d'entretien", o: "doc" },
      { id: "doc_ct", txt: "Dernier rapport de contrôle technique", o: "doc" },
      { id: "doc_dta", txt: "Dossier technique amiante (DTA)", o: "doc" },
      { id: "doc_eds", txt: "Fiche signalétique précédente affichée en machinerie", o: "doc" }
    ]
  }
];

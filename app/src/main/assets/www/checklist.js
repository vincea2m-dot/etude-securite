// Étude de sécurité ascenseur — dispositifs de l'article R134-3 du Code de la construction et de l'habitation
// (ascenseurs installés avant le 27 août 2000).
// t: "elec" = ascenseur électrique seulement, "hyd" = hydraulique seulement.
window.CHECKLIST = [
  {
    id: "g1", nom: "Échéance 31/12/2010", items: [
      { id: "1-1", ref: "I-1", txt: "Serrures munies de dispositifs de contrôle de fermeture et de verrouillage des portes palières" },
      { id: "1-2", ref: "I-2", txt: "Dispositif empêchant ou limitant les actes portant atteinte à la sécurité du verrouillage des portes palières" },
      { id: "1-3", ref: "I-3", txt: "Dispositif de détection de présence des personnes contre le choc des portes coulissantes" },
      { id: "1-4", ref: "I-4", txt: "Clôture de la gaine empêchant l'accès à la gaine et aux éléments de déverrouillage des serrures" },
      { id: "1-5", ref: "I-5", txt: "Parachute de cabine et limiteur de vitesse en descente", t: "elec" },
      { id: "1-6", ref: "I-6", txt: "Dispositif de protection contre la chute dans la gaine (cabine arrêtée hors zone de déverrouillage)" },
      { id: "1-7", ref: "I-7", txt: "Commande d'inspection et stops sur le toit de cabine, en gaine et en cuvette" },
      { id: "1-8", ref: "I-8", txt: "Moyens d'accès sécurisés aux locaux des machines et des poulies" },
      { id: "1-9", ref: "I-9", txt: "Verrouillage des portes et portillons d'inspection / de secours avec arrêt automatique à l'ouverture" }
    ]
  },
  {
    id: "g2", nom: "Échéance 03/07/2014", items: [
      { id: "2-1", ref: "II-1", txt: "ERP installés avant le 01/01/1983 : contrôle de l'arrêt et du maintien à niveau à chaque palier" },
      { id: "2-2", ref: "II-2", txt: "Système de téléalarme vers un service d'intervention et éclairage de secours en cabine" },
      { id: "2-3", ref: "II-3", txt: "Résistance mécanique suffisante des portes palières vitrées" },
      { id: "2-4", ref: "II-4", txt: "Hydraulique : protection contre la chute libre, la dérive et la survitesse", t: "hyd" },
      { id: "2-5", ref: "II-5", txt: "Protection contre le contact direct avec les pièces nues sous tension (armoires, tableaux d'arrivée)" },
      { id: "2-6", ref: "II-6", txt: "Protection contre l'happement par les organes mobiles (poulies, câbles, courroies)" },
      { id: "2-7", ref: "II-7", txt: "Éclairage fixe suffisant du local des machines ou des poulies" }
    ]
  },
  {
    id: "g3", nom: "Échéance 03/07/2018", items: [
      { id: "3-1", ref: "III-1", txt: "ERP installés après le 31/12/1982 : contrôle de l'arrêt et du maintien à niveau à chaque palier" }
    ]
  }
];

window.ETATS = [
  { v: "C", nom: "Conforme", rgb: [34, 139, 64] },
  { v: "NC", nom: "Non conforme", rgb: [200, 45, 40] },
  { v: "SO", nom: "Sans objet", rgb: [130, 138, 146] }
];

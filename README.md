# EDS Ascenseurs – application Android

Application simple pour réaliser les **études de sécurité spécifiques (EDS)** d'ascenseurs prévues par les
articles R4543-10 à R4543-13 du Code du travail :

- description de l'appareil et conditions d'accès au bâtiment ;
- accès à la machinerie, risques en machinerie, toit de cabine, gaine, cuvette, paliers et autres risques, avec cases **Risque présent / Absent / Sans objet** et mesure de prévention type proposée automatiquement ;
- dispositifs d'aide à la manutention et état de la documentation technique ;
- observations et modes opératoires particuliers ;
- **signature du technicien** au doigt ;
- **PDF** avec **fiche signalétique à pictogrammes** (page 1, à afficher en machinerie) suivie de l'étude complète, enregistré dans *Téléchargements / Etudes securite* et partageable (e-mail, WhatsApp, Drive…).

Tout fonctionne sans réseau ; les études restent enregistrées sur le téléphone.
Le logo du rapport se choisit dans les réglages (icône en haut à droite de la liste).

## Obtenir l'APK

### Avec GitHub (automatique)
Chaque envoi sur la branche `main` compile l'APK. Il se télécharge ensuite depuis l'onglet **Releases** du dépôt
(fichier `EtudeSecurite.apk`), ou directement :
`https://github.com/<compte>/<dépôt>/releases/latest/download/EtudeSecurite.apk`

### Avec Android Studio
Ouvrir le dossier du projet, attendre la synchronisation, puis **Build > Build APK(s)**.

## Installer sur le téléphone
Ouvrir le fichier `EtudeSecurite.apk` et autoriser « Installer des applis inconnues » pour le navigateur ou le gestionnaire de fichiers.
Les mises à jour s'installent par-dessus l'ancienne version sans perdre les études (signature fixe : `app/signature.jks`).

## Modifier la liste des points
Fichier `app/src/main/assets/www/checklist.js`.

# Étude Sécurité – application Android

Application simple pour réaliser les **études de sécurité d'ascenseurs** sur le terrain :

- fiche d'identification de l'appareil (site, client, type, marque, année, ERP…) ;
- les 17 dispositifs de l'article R134-3 du CCH, avec cases **Conforme / Non conforme / Sans objet** et une observation par point ;
- observations générales ;
- **signature du technicien** au doigt ;
- **rapport PDF** enregistré dans *Téléchargements / Etudes securite* et partageable (e-mail, WhatsApp, Drive…).

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

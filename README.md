# Matcha - Find Your Peer
Ce projet est un site de rencontres.
C'est une application permettant à un utilisateur de s’inscrire
et de renseigner ses détails personnels et ses préférences, en vue de pouvoir
matcher avec un autre utilisateur ayant un profil plus ou moins correspondant.

Une fois qu’ils se sont réciproquement matchés, ces deux profils devront pouvoir s’échanger
des mots doux via un chat privé.

Le sujet du projet 42 se trouve à la racine dans le fichier Sujet.pdf

Technologies nécessaires:
- Node.js >= v8.12.0
- NPM >= 6.4.1 
- MySQL >= 8.0.11

Pour lancer le site: 
1) Cloner ce répertoire
2) Taper "npm i" à la racine du répertoire
3) Lancer MySQL puis insérer vos identifiants dans le fichier server.js
4) Taper "node server.js" à la racine
5) Rentrer "localhost:8080" dans votre navigateur web (testé avec Chrome)

Pour lancer le seed et créer 600 utilisateurs, taper "localhost:8080/seed" (ceci ne marche que une fois)
- Les identifiants de ces utilisateurs: FakeUser(numéro) example: FakeUser42
- Mot de Passe pour tous: Fakeuser42

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Le joueur visé aime les énigmes courtes. Il ne connaît pas le scénario et joue seul, sur un ordinateur, une partie de 10 à 15 minutes qu'il peut rejouer pour tester d'autres pistes. Sa tâche : lire la situation, choisir une action, comprendre ce qu'elle a produit, puis accuser le bon suspect avec deux preuves avant l'aube.

Le jury Ynov juge cette même expérience pendant la démonstration de soutenance, projetée, et pendant le test utilisateur. L'interface est conçue d'abord pour le joueur ; la démo projetée est une contrainte de lisibilité, pas un public distinct.

## Product Purpose

« La Dernière Auberge » est un jeu d'enquête au tour par tour, joué dans le navigateur. Une tempête bloque des voyageurs à l'Auberge du Col Blanc ; l'aubergiste est retrouvé mort à 1h00. L'enquêteur dispose de 12 actions de 30 minutes (1h00 → 7h00) pour se déplacer, fouiller, interroger les 4 suspects, puis accuser l'un d'eux avec exactement 2 indices de son carnet.

Le jeu réussit quand le joueur ressent la pression du temps, relie lui-même deux éléments pour faire craquer un suspect, et comprend à la fin pourquoi il a gagné ou perdu.

## Positioning

La déduction reste celle du joueur : le jeu ne signale jamais quel indice est une preuve, et l'accusation exige de choisir soi-même ses 2 preuves. Le hasard de la fouille est borné (une fouille ratée garantit la suivante), pour que la réflexion compte plus que la chance.

## Operating Context

- Partie unique, en local : le serveur Fastify garde l'état en mémoire, l'interface React affiche ce qu'il renvoie et n'envoie que des intentions.
- Projet étudiant YBoost B2 (Ynov Toulouse), équipe de 4, 9 journées ; soutenance de 15 minutes avec démonstration projetée.
- Test utilisateur prévu aux J7-J8 : une personne qui ne connaît pas le scénario joue sans aide.
- Écrans : ordinateur portable (jeu, test, développement) et vidéoprojecteur (démo). L'interface doit rester lisible sur petit écran, sans version mobile dédiée.

## Capabilities and Constraints

- Écrans : Accueil, Partie (avec panneau d'interrogatoire et modale d'accusation), Fin avec récapitulatif. « Rejouer » et « Rejouer la même partie » (même graine).
- Le serveur est maître des règles. L'interface ne calcule aucune conséquence de jeu, remplace son état par l'objet `game` reçu après chaque réponse et ne fait pas de mise à jour optimiste.
- Un refus ne coûte rien et s'affiche comme un message ; un échec de jeu (fouille ratée, question sans effet) est un résultat normal du récit. Les erreurs techniques ne sont jamais présentées comme un événement narratif.
- À l'aube (statut `dawn`), seule l'accusation reste possible : « Dernière chance ».
- Hors V1 : sons, illustrations dessinées, animations élaborées, comptes, sauvegarde, hébergement.
- Stack : React + Vite en TypeScript, Tailwind CSS déjà installé, Vitest et Testing Library.

## Brand Commitments

- Nom : « La Dernière Auberge ». Lieu : l'Auberge du Col Blanc, une nuit de tempête en montagne.
- Langue : français. Les textes narratifs du scénario vouvoient le joueur (« Vous trouvez… »).
- Les textes d'interface restent dans le récit, sobres et sans jargon technique : « Fouiller la cuisine », « Il est 2h30 », « Dernière chance ».

## Evidence on Hand

- Le scénario (pièces, suspects, indices, textes) est écrit par l'équipe dans la doc de conception ; aucun texte de jeu ne doit être inventé dans l'interface.
- Aucune illustration, aucun logo, aucune police imposée.

## Product Principles

1. Le temps est la ressource : l'heure et les actions restantes sont toujours visibles et chaque action montre ce qu'elle a coûté.
2. Le joueur déduit, le jeu ne souffle pas : aucun marquage de preuve, aucune aide qui trahirait la solution.
3. Chaque action a une conséquence lisible : le dernier événement est mis en évidence à chaque changement.
4. Refus, échec de jeu et panne restent distincts à l'écran.
5. La fin explique : le récapitulatif donne envie de rejouer.

## Accessibility & Inclusion

- Contrôles en vrais `<button>`, utilisables au clavier, focus visible.
- Libellés explicites (« Interroger Hélène Duval »).
- Verrouillage, statut et nouveaux indices signalés par une icône et un texte, jamais par la couleur seule.
- Dernier événement annoncé avec `aria-live="polite"`.
- Ambiance sombre mais lisible : contraste suffisant, y compris au vidéoprojecteur ; texte confortable.
- Mouvement réduit respecté (`prefers-reduced-motion`).

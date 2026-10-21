---
name: La Dernière Auberge
description: Jeu d'enquête au tour par tour, écrit dans le registre d'une auberge de montagne une nuit de tempête.
colors:
  leather: "#1c1410"
  page: "#2a1f19"
  ink: "#e9dcc4"
  ink-faded: "#a8977c"
  rule: "#4a3a2e"
  oxblood: "#8a2b1f"
  oxblood-lit: "#a13626"
  gilt: "#c9a24a"
typography:
  display:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 1
  headline:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1.25
  body:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.556
rounded:
  none: "0"
spacing:
  binding-sm: "0.75rem"
  binding: "2rem"
  page-x-sm: "1.5rem"
  page-y-sm: "2.5rem"
  page: "3.5rem"
  section: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.oxblood}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.oxblood-lit}"
    textColor: "{colors.ink}"
  page-sheet:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "3.5rem"
    width: "72rem"
---

# Design System: La Dernière Auberge

<!-- Source de vérité : frontend/src/styles/global.css (@theme Tailwind v4). Les tokens ci-dessus sont normatifs ; ce fichier décrit ce qui est construit. Les éléments marqués « prévu, pas encore construit » viennent du contrat de direction impeccable (local, `.impeccable/` n'est pas versionné) et guident les écrans à venir (#25, #35, #36). -->

## Overview

**Creative North Star: "Le Livre d'hôtes"**

L'enquête s'écrit dans le registre de l'auberge : chaque action devient une ligne horodatée. L'interface est une page de registre posée dans une reliure de cuir sombre : encre claire sur papier brun, un seul filet d'un pixel pour cadrer, une seule couleur d'action (sang-de-bœuf) et une dorure réservée à ce qui est « maintenant » (heure présente, focus, sélection).

Le système refuse le tableau de bord de jeu sombre : pas de cartes arrondies, pas d'ombres, pas de dégradés, pas d'accent or partout. La profondeur vient de deux tons (reliure, page) et de filets, jamais d'élévation. Une seule famille, EB Garamond ; la hiérarchie passe par la taille et l'italique, pas par une seconde police.

État actuel (issue #9) : la coquille est construite (reliure, page, trois écrans avec titre, bouton principal, surfaces navigateur, focus). La double page de l'écran Partie, le registre et le carnet sont **prévus, pas encore construits**.

**Key Characteristics:**
- Deux tons de fond (reliure, page), encre claire, un filet de 1 px.
- Angles droits partout (0).
- Une seule police : EB Garamond, auto-hébergée (400, 400 italique, 600).
- Sang-de-bœuf = action principale ; dorure = présent et focus.
- Aucune ombre, aucun dégradé, aucune carte.
- L'état se lit par la forme de la ligne et un texte, jamais par la couleur seule.

## Colors

Une palette de cuir, de papier brun et d'encre, avec deux accents rares : sang-de-bœuf pour agir, dorure pour « maintenant ».

### Primary
- **Sang-de-bœuf** (oxblood) : fond et bordure du bouton d'action principale. Une seule action principale par vue.
- **Sang-de-bœuf éclairé** (oxblood-lit) : survol du bouton principal uniquement.

### Secondary
- **Dorure** (gilt) : anneau de focus, sélection de texte, curseur de saisie. Prévu, pas encore construit : ligne présente du registre et rubriques.

### Neutral
- **Reliure** (leather) : fond de la fenêtre (`html`), couleur de thème du navigateur (`theme-color`), piste de la barre de défilement, texte sur sélection dorée.
- **Page** (page) : la feuille de registre qui porte tout le contenu.
- **Encre** (ink) : texte courant et titres, texte du bouton principal.
- **Encre pâle** (ink-faded) : texte secondaire (descriptions, heures passées). Défini, pas encore utilisé dans la coquille.
- **Filet** (rule) : bordure de 1 px de la page, poignée de la barre de défilement, futurs filets de registre. Décoratif : ne porte jamais seul une information.

### Named Rules
**La règle de la dorure rare.** La dorure ne marque que le présent : l'heure en cours, l'élément focalisé, la sélection. Jamais de bouton doré, jamais de titre doré décoratif.

**La règle de l'unique action.** Le sang-de-bœuf habille au plus une action par vue. Les autres actions sont en encre sur filet.

## Typography

**Display Font:** EB Garamond (repli Georgia, serif)
**Body Font:** EB Garamond (repli Georgia, serif)

**Character:** une Garamond de registre ancien, sans seconde famille. L'italique fait les titres ; le romain fait le texte et les actions.

Base : la racine est à 118,75 % (1rem = 19 px) pour rester lisible au vidéoprojecteur ; interligne 1,5 ; lissage antialiasé.

### Hierarchy
- **Display** (400 italique, 3rem puis 4.5rem dès `sm`, interligne 1) : titre du jeu sur l'accueil uniquement.
- **Headline** (400 italique, 2.25rem puis 3.75rem dès `sm`, interligne 1.25) : titre d'écran (« L'enquête », « L'aube »). Reçoit le focus au changement d'écran.
- **Body** (400, 1rem, interligne 1.5) : texte courant et récit. Viser 60 à 70 caractères par ligne.
- **Label** (400, 1.125rem) : texte des boutons.
- Les titres `h1`–`h3` sont équilibrés (`text-wrap: balance`).

### Prévu, pas encore construit
- **Nom de pièce** : grand italique (même registre que Headline).
- **Rubriques** (« Registre de la nuit », « Ici », « Se déplacer », carnet) : petites capitales espacées, en dorure. Ce sont des titres de section réels (`h2`), pas des surtitres.
- **Heures et compteurs** : chiffres tabulaires (`font-variant-numeric: tabular-nums`) pour que 1h00 → 7h00 et les actions restantes s'alignent.
- La graisse 600 est chargée pour ces usages ; ne pas l'utiliser pour du gras décoratif.

### Named Rules
**La règle de la famille unique.** EB Garamond seule. Aucune police système en titre, aucune seconde famille, aucune police d'icônes.

## Layout

Une reliure (fond `leather`) entoure une feuille (`page`) centrée, de largeur maximale 72rem, haute d'au moins tout l'écran moins la marge de reliure.

- Marge de reliure : 0.75rem sur petit écran, 2rem dès `sm` (640 px).
- Marge intérieure de la page : 1.5rem × 2.5rem sur petit écran, 3.5rem dès `sm`.
- Écart titre → action : 3rem.
- Largeur minimale du document : 320 px. Pas de version mobile dédiée, mais tout reste lisible sur petit écran.

Prévu, pas encore construit : l'écran Partie en double page dans la feuille. Page gauche : « Registre de la nuit », 1h00 à 7h00, ligne présente en dorure. Page droite : heure et actions restantes en tête, nom de pièce en grand italique, description, rubriques « Ici » puis « Se déplacer » (boutons), carnet. Les deux pages s'empilent sur petit écran.

## Elevation & Depth

Système plat. Aucune ombre (`box-shadow`), aucun flou d'arrière-plan, aucun dégradé. La profondeur tient en deux tons (reliure plus sombre que la page) et en filets de 1 px couleur `rule`.

### Named Rules
**La règle du papier à plat.** Rien ne flotte au-dessus de la page. Un élément se distingue par un filet, un ton ou la typographie, jamais par une ombre.

## Shapes

Angles droits partout (0). Les bordures sont des filets pleins de 1 px. La feuille est un rectangle cadré d'un filet `rule` ; le bouton principal porte une bordure de sa propre couleur.

### Named Rules
**La règle de la forme de ligne.** L'état d'un élément se lit par la forme de son filet et un texte, jamais par la couleur seule : **plein = joué**, **tirets = verrouillé**, **barré = épuisé**. (Prévu, pas encore construit ; s'applique au registre, aux boutons d'action et au carnet.)

## Components

### Buttons
Franc et sobre, comme un tampon d'encre.
- **Shape :** angles droits (0), bordure 1 px.
- **Primary :** fond et bordure sang-de-bœuf, texte encre, label 1.125rem, marge 0.75rem × 1.5rem. Toujours un vrai `<button type="button">`.
- **Hover :** passage au sang-de-bœuf éclairé.
- **Active :** léger enfoncement (échelle 0.97), supprimé sous `prefers-reduced-motion`.
- **Transition :** couleur de fond et transformation, 150 ms, courbe `--ease-out` (cubic-bezier(0.23, 1, 0.32, 1)).
- **Focus :** anneau doré global (voir ci-dessous).
- **Secondaire (prévu, pas encore construit) :** encre sur filet `rule`, fond transparent, mêmes angles et marges. Les états verrouillé / épuisé suivent la règle de la forme de ligne.

### Page (feuille de registre)
- **Corner Style :** droit (0).
- **Background :** `page` sur reliure `leather`.
- **Shadow Strategy :** aucune (voir Elevation & Depth).
- **Border :** filet 1 px `rule`.
- **Internal Padding :** voir Layout.

### Focus et changement d'écran
- **Focus visible :** contour 2 px dorure, décalé de 3 px, sur tout élément interactif (règle globale `:focus-visible`). Ne jamais le retirer sur un contrôle.
- **Changement d'écran :** le `h1` de l'écran reçoit le focus au montage (`tabIndex={-1}`, ref de rappel stable au niveau du module). Seul ce titre non interactif supprime son contour.

### Surfaces du navigateur
- `lang="fr"`, `theme-color` = reliure.
- Sélection : fond dorure, texte reliure. Curseur de saisie doré.
- Barre de défilement : poignée `rule` sur piste `leather`.

### Registre de la nuit (prévu, pas encore construit)
Signature du système. Une ligne horodatée par demi-heure, de 1h00 à 7h00, chiffres tabulaires ; la ligne présente est en dorure ; l'état de chaque ligne suit la règle de la forme de ligne. **Mouvement signature :** la nouvelle ligne s'encre (opacité 0 → 1 et léger flou → net, 200 ms, `--ease-out`) ; sous `prefers-reduced-motion`, simple fondu d'opacité. Le dernier événement est annoncé avec `aria-live="polite"`.

## Do's and Don'ts

### Do:
- **Do** utiliser uniquement les tokens de `global.css` via Tailwind (`bg-page`, `text-ink`, `border-rule`, `bg-oxblood`…). Pas de couleur codée en dur.
- **Do** garder angles droits et filets de 1 px.
- **Do** réserver le sang-de-bœuf à une seule action principale par vue et la dorure au présent et au focus.
- **Do** donner le focus au `h1` de chaque nouvel écran.
- **Do** signaler l'état par la forme du filet et un texte : plein = joué, tirets = verrouillé, barré = épuisé.
- **Do** utiliser des chiffres tabulaires pour les heures et compteurs.
- **Do** respecter `prefers-reduced-motion` : fondu seulement, aucun déplacement ni flou.

### Don't:
- **Don't** placer de surtitre ou de « kicker » au-dessus d'un titre. Une rubrique est le titre de sa section, pas une étiquette posée sur un autre titre.
- **Don't** utiliser de carte avec ombre, d'ombre portée, ni d'ombre décalée.
- **Don't** utiliser de dégradé.
- **Don't** arrondir les angles.
- **Don't** signaler un état par la couleur seule.
- **Don't** utiliser de caractère-glyphe ou d'emoji comme icône ; une icône, si nécessaire, est un SVG accompagné d'un texte.
- **Don't** ajouter une seconde famille de police ni une police système en titre.
- **Don't** colorer en dorure des boutons ou des titres décoratifs.

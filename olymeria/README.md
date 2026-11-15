# Olymeria : quiz culturels quotidiens

Chaque jour, une vidéo TikTok de 20 secondes est créée et programmée sur le compte `olymeria_` via Buffer.

## Contenu de ce dossier

- `quizzes/AAAA-MM-JJ.json` : les questions déjà faites. Ne jamais répéter une réponse ni un sujet.
- `videos/AAAA-MM-JJ.mp4` : les vidéos, publiques via GitHub Pages.
- `generator/` : le générateur vidéo.
- `brand/` : le logo.

## Règles éditoriales

- Français correct, tutoiement. Culture générale : histoire, géographie, art, sciences, patrimoine, littérature, architecture.
- Une question surprenante, de préférence un piège où la réponse évidente est fausse.
- Chaque question doit se rattacher à un lieu réel, car la vidéo vole de la France vers ce lieu.
- Quatre réponses plausibles et courtes. Varier la position de la bonne réponse.
- Vérifier le fait et les chiffres dans au moins deux sources fiables, dont une de référence si possible. En cas de doute ou de désaccord entre sources, changer de question.
- Pas de statistique inventée, comme « 95 % des gens se trompent ».
- Éviter la politique, la religion, les conflits, les personnes privées et tout sujet choquant.
- Ne pas révéler la réponse dans la légende du post.

## Format d'un quiz

Voir `quizzes/2026-11-06.json` pour un exemple complet.

| Champ | Rôle |
| --- | --- |
| `date` | Date de publication, AAAA-MM-JJ |
| `kicker` | Bandeau rouge en majuscules, par exemple `QUESTION PIÈGE` ou `CULTURE G` |
| `question` | La question |
| `highlight` | Un ou deux mots de la question à mettre en jaune |
| `options`, `correct` | Les 4 réponses et l'indice de la bonne, de 0 à 3 |
| `badge` | Optionnel : valeur courte affichée sur la bonne réponse |
| `answer`, `subtitle` | Grand titre de la réponse et explication sur 2 lignes (`\n`) |
| `map.focus`, `map.zoom` | Point `[longitude, latitude]` où finit le vol et zoom, de 900 à 3000 |
| `map.highlight` | Pays à colorer, avec leur nom anglais Natural Earth, par exemple `Mexico` |
| `map.pin` | Optionnel : point rouge `[longitude, latitude]` |
| `map.border` | Optionnel : frontière à tracer entre 2 pays |
| `map.labels` | Étiquettes `{lon, lat, text, style, dx, dy}` ; `style` vaut `red` ou reste vide |
| `fact.big` | Grand chiffre ou texte du panneau |
| `fact.count`, `decimals`, `unit` | Optionnels : compteur animé vers cette valeur |
| `fact.caption` | Phrase sous le grand chiffre |
| `fact.bars` | Optionnel : 2 barres `{label, value, text}` |
| `caption` | Texte du post, sans la réponse |
| `sources` | URL des sources vérifiées |

Le panneau du chiffre couvre l'image à partir de 1010 px de haut. Le lieu doit donc rester au-dessus, ce que `map.focus` permet de régler.

## Générer

```bash
cd olymeria/generator
npm install
node make.js stills ../quizzes/AAAA-MM-JJ.json
node make.js video ../quizzes/AAAA-MM-JJ.json ../videos/AAAA-MM-JJ.mp4
```

`stills` écrit les images clés dans `generator/build/`. `make.js` refuse un quiz mal rempli ou un texte hors de la zone visible sur TikTok.

## Publier

Deux vidéos par jour, chacune avec une question différente sur un thème différent.

- Fichiers : `quizzes/AAAA-MM-JJ-1.json` et `-2.json`, `videos/AAAA-MM-JJ-1.mp4` et `-2.mp4`. Les fichiers plus anciens sans suffixe restent valables pour l'historique.
- URL de la vidéo : `https://pedrovish.github.io/olymeria/videos/AAAA-MM-JJ-N.mp4`
- Compte Buffer : `olymeria_`, canal `6aeda5f1e29c69a1717f850c`, organisation `6aa27930fb6c740e3d1f107a`
- Supprimer de `videos/` les vidéos de plus de 14 jours, une fois publiées, pour garder le dépôt léger.

### Horaires (heure de Paris)

| Jour | Créneau 1 | Créneau 2 |
| --- | --- | --- |
| Lundi | 13:00 | 19:00 |
| Mardi | 07:00 | 19:00 |
| Mercredi | 12:30 | 21:30 |
| Jeudi | 13:00 | 21:30 |
| Vendredi | 18:00 | 21:00 |
| Samedi | 13:00 | 17:00 |
| Dimanche | 09:00 | 13:00 |

Choisis d'après l'étude Buffer sur 7,1 millions de posts (https://buffer.com/fr/resources/meilleure-heure-pour-publier-sur-tiktok) et le pic de début de soirée en semaine. À revoir avec les vues réelles par créneau après deux semaines.

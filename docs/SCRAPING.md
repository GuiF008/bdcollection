# Scraping Bedetheque — cache catalogue

Ce module ajoute un **catalogue technique** (`CatalogSeries` / `CatalogAlbum`) distinct des entités **collection** (`Series` / `Album`). Il sert de cache pour les fiches Bedetheque, avec expiration à **30 jours** et refresh manuel.

## Prérequis

- PostgreSQL avec `DATABASE_URL` (voir `.env.example`)
- Migration : `npx prisma migrate deploy` (ou `npm run db:migrate` en dev) après avoir démarré la base

## Lancer le projet

```bash
docker compose up -d db   # si vous utilisez Docker
npm install
npx prisma migrate deploy
npm run dev
```

## Importer une série

### API

`POST /api/scraping/import`

```json
{
  "source": "bedetheque",
  "url": "https://www.bedetheque.com/serie-6-BD-Lanfeust-de-Troy.html"
}
```

- Si la série est **déjà en cache** : réponse `fromCache: true` sans re-scraper. Le champ `stale` indique si `cacheExpiresAt` est dépassé.
- Sinon : import synchrone (plusieurs requêtes HTTP séquentielles si pagination / page « Tout »).

### CLI

```bash
npm run import:series -- "https://www.bedetheque.com/serie-6-BD-Lanfeust-de-Troy.html"
```

## Autres endpoints

| Méthode | Route | Rôle |
|--------|--------|------|
| POST | `/api/scraping/refresh` | Body `{ "seriesId": "<id CatalogSeries>" }` — force un refresh |
| GET | `/api/series/[id]` | Série catalogue + albums |
| GET | `/api/series/search?q=lanfeust` | Recherche titre/slug en cache |
| GET | `/api/scraping/jobs?limit=50` | Liste des `ImportJob` (debug / admin) |

Les réponses incluent **`isStale`** (calculé : `now > cacheExpiresAt`).

## Tests

```bash
npm run test
```

## Décisions techniques (V1)

- **Pas de Puppeteer** : HTML statique + Cheerio.
- **User-Agent** explicite et **timeout** ~25 s, **peu de retries** sur erreurs réseau / 5xx.
- **Pagination** : si un lien « Tout » existe, une seule page complète est chargée ; sinon pages numérotées avec une pause courte entre requêtes.
- **Anti-doublon albums** : contrainte unique `(catalogSeriesId, sourceAlbumId)` + `upsert`.
- **Import concurrent** : refus si un `ImportJob` est déjà `running` pour la même URL ou le même `catalogSeriesId`.
- **Images** : seule l’URL de couverture est stockée (pas de téléchargement en V1).

## Limites connues

- Le HTML Bedetheque peut **changer** ; les parseurs sont tolérants mais une refonte du site peut casser partiellement l’extraction.
- Certains champs (ex. parution précise) ne sont pas toujours présents sur la **liste** des albums.
- Le délai d’import peut être **long** sur les grosses séries (nombreuses pages).
- Aucune **authentification** sur ces routes : à protéger (middleware, clé API) avant exposition publique.

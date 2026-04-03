# BD Collection

Application web self-hosted de gestion de collection de bandes dessinées.

## Stack technique

- **Frontend** : Next.js 16, TypeScript, Tailwind CSS 4
- **Backend** : Next.js Server Actions & Route Handlers
- **Base de données** : PostgreSQL 16 + Prisma ORM
- **Déploiement** : Docker Compose, prêt pour VPS

## Fonctionnalités MVP

- Dashboard avec KPIs et statistiques
- CRUD complet des séries/collections
- CRUD complet des albums
- Recherche globale insensible à la casse et au contenant
- Tri multi-critères (titre, auteur, éditeur, date, tome)
- Filtres avancés (série, auteur, éditeur, édition originale, couverture)
- Upload de couvertures (stockage local)
- Import JSON / Export JSON + CSV
- Interface responsive (desktop + tablette)
- Page paramètres

## Prérequis

- Node.js 20+
- PostgreSQL 16 (ou Docker)

## Installation locale

```bash
# Cloner le projet
cd bd-collection

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres PostgreSQL

# Générer le client Prisma
npm run db:generate

# Appliquer le schéma à la base
npm run db:push

# (Optionnel) Insérer les données de démonstration
npm run db:seed

# Lancer en développement
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

## Déploiement VPS avec Docker

### Prérequis
- Docker et Docker Compose installés sur le VPS
- Port 3000 disponible (ou configurer un reverse proxy)

### Lancement

```bash
# Cloner le projet sur le VPS
cd bd-collection

# Lancer les services
docker compose up -d

# Appliquer les migrations
docker compose exec app npx prisma db push

# (Optionnel) Seed de démonstration
docker compose exec app npx tsx prisma/seed.ts
```

L'application est accessible sur `http://votre-vps:3000`.

### Reverse proxy (Nginx)

```nginx
server {
    listen 80;
    server_name bd.votre-domaine.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Structure du projet

```
bd-collection/
├── prisma/
│   ├── schema.prisma          # Schéma de données
│   └── seed.ts                # Données de démonstration
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Pages avec layout dashboard
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── albums/        # CRUD albums
│   │   │   ├── series/        # CRUD séries
│   │   │   ├── import-export/ # Import/Export
│   │   │   └── settings/      # Paramètres
│   │   ├── actions/           # Server actions
│   │   └── api/               # Route handlers (search, export, import, uploads)
│   ├── components/
│   │   ├── layout/            # Sidebar, Header, SearchBar
│   │   ├── ui/                # KpiCard, Badge, CoverImage, etc.
│   │   ├── forms/             # SeriesForm, AlbumForm, ImportForm
│   │   ├── albums/            # AlbumListClient (tri/filtres côté client)
│   │   └── actions/           # DeleteSeriesButton, DeleteAlbumButton
│   ├── lib/
│   │   ├── domain/            # Types et normalisation
│   │   ├── services/          # Logique métier (albums, series, dashboard, search, export)
│   │   ├── db/                # Client Prisma
│   │   ├── storage/           # Upload de fichiers
│   │   └── future-integrations/ # Documentation V2
│   └── generated/             # Client Prisma généré
├── docker-compose.yml
├── Dockerfile
└── uploads/                   # Stockage des couvertures
```

## Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://bdcollection:bdcollection@localhost:5432/bdcollection` |
| `UPLOAD_DIR` | Répertoire de stockage des images | `./uploads` |
| `NEXT_PUBLIC_APP_NAME` | Nom affiché de l'application | `BD Collection` |

## Commandes utiles

```bash
npm run dev          # Développement
npm run build        # Build de production
npm run start        # Lancer la production
npm run db:generate  # Générer le client Prisma
npm run db:push      # Appliquer le schéma
npm run db:migrate   # Créer une migration
npm run db:seed      # Insérer les données de démo
npm run db:studio    # Interface Prisma Studio
```

## Limites du MVP

- Pas d'authentification (usage personnel sur VPS privé)
- Pas de récupération automatique de métadonnées
- Pas de connexion à des API externes
- Pas de cotes / valorisations automatiques
- Pas de gestion multi-utilisateurs
- Import limité au format JSON

## Roadmap V2

- [ ] Connexion à des API de référencement BD (BDGest, BDPhile)
- [ ] Récupération automatique de couvertures
- [ ] Enrichissement des métadonnées via ISBN/EAN (Google Books, Open Library)
- [ ] Système de cotes et valorisations
- [ ] Authentification (usage multi-utilisateurs)
- [ ] Gestion des wishlists / albums manquants
- [ ] Statistiques avancées avec graphiques
- [ ] Import CSV
- [ ] PWA pour usage mobile
- [ ] Système de tags personnalisés

## Licence

Projet personnel — Usage privé.

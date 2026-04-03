# Future Integrations (V2)

Cet espace est réservé aux futures intégrations externes prévues pour la V2.

## Intégrations planifiées

### Sources de données
- **BDGest / BDPhile** : récupération de métadonnées, couvertures, cotes
- **Google Books API** : enrichissement ISBN/EAN
- **Open Library** : données complémentaires

### Fonctionnalités V2
- Import automatique depuis des référentiels
- Synchronisation des cotes et valorisations
- Récupération automatique de couvertures
- Enrichissement des métadonnées via ISBN/EAN
- Export vers des services tiers

## Architecture prévue

Chaque intégration sera implémentée sous forme d'adapter :

```
lib/future-integrations/
  adapters/
    bdgest.ts
    google-books.ts
    open-library.ts
  types.ts
  registry.ts
```

### Champs prêts dans le modèle Album
- `externalSource` : nom du provider (ex: "bdgest", "google-books")
- `externalId` : identifiant dans le système externe
- `isbn` / `ean` : identifiants standards
- `editionLabel` : label d'édition enrichi
- `estimatedValue` : valeur estimée
- `valuationSource` : source de la valorisation
- `lastSyncAt` : date de dernière synchronisation

Ces champs sont présents dans le schéma mais inutilisés dans le MVP.

# KT Team Dashboard

Dashboard pour préparer un tournoi Kill Team en équipe de 5.

## Utilisation

Le dashboard est déployé sur : https://kt-team-dashboard.vercel.app

### Mettre à jour les données

Prérequis : Node.js 20+, un token Vercel.

```bash
# 1. Installer les dépendances (première fois uniquement)
npm install

# 2. Récupérer les données fraîches depuis BCP + déployer
npm run update
```

Ou étape par étape :

```bash
# Récupérer les données uniquement (sans déployer)
npm run fetch-data

# Déployer sur Vercel
vercel deploy --prod
```

### Développement local

```bash
npm run dev
# Ouvrir http://localhost:3000
```

## Données

- Source : API Best Coast Pairings (non officielle)
- Période : depuis le 1er janvier 2026
- Filtre : tournois terminés avec 8+ joueurs, Kill Team uniquement
- Découpage Q1 (Jan–Avr) / Q2 (Mai+)

Les données sont stockées dans `src/data/kt-stats.json` et embarquées dans le build statique.

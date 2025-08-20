# Système d'Abonnement Simplifié

## Vue d'ensemble

Le système d'abonnement a été simplifié pour éliminer la complexité des "périodes d'essai" et utiliser un modèle plus direct.

## Nouveau Fonctionnement

### Plan de Base : "Free"

- **À l'inscription** : L'utilisateur obtient automatiquement le plan "free"
- **Status** : "active" (pas "trialing")
- **Durée** : 30 jours pour tester toutes les fonctionnalités
- **Limites** : 10,000 événements par mois
- **Après 30 jours** : Les fonctionnalités premium sont bloquées si aucun abonnement payant

### Abonnement Payant

- **Lors de la souscription** : Passage direct au plan payant (hobby/pro/enterprise)
- **Status** : "active"
- **Durée restante** : Peu importe le temps restant sur les 30 jours gratuits
- **Fonctionnalités** : Accès à toutes les fonctionnalités premium

## Structure de la Base de Données

```sql
-- Table subscriptions
{
  user_id: string,
  plan_tier: 'free' | 'hobby' | 'pro' | 'enterprise',
  status: 'active' | 'canceled',
  stripe_subscription_id: string | null,
  trial_start: timestamp, -- Date de création du compte (pour référence)
  trial_end: timestamp,   -- Date limite des 30 jours gratuits
  events_limit: number,
  ...
}
```

## Logique de Vérification

### Utilisateur Payant
```typescript
const hasPaidPlan = subscription.plan_tier !== "free" && 
                   subscription.stripe_subscription_id && 
                   subscription.stripe_subscription_id !== "";
```

### Utilisateur Gratuit
```typescript
const isWithinFreeLimit = subscription.trial_end > new Date();
const hasLimitations = !isWithinFreeLimit;
```

## Fonctionnalités Affectées

### ✅ Toujours Accessible
- Analytics de base
- Dashboard
- 1 site web
- Vues de base

### 🔒 Limité après 30 jours (plan free)
- Funnels
- Goals avancés
- Export de données
- Sites supplémentaires

### 💎 Accessible avec abonnement payant
- Toutes les fonctionnalités
- Limites d'événements augmentées
- Support prioritaire

## Migration

La migration `20250820120000_simplify_subscription_system.sql` :

1. Convertit tous les comptes "trialing" en "free" + "active"
2. Met à jour la fonction de création de compte
3. Simplifie la logique de vérification

## Avantages

1. **Plus simple à comprendre** : Free pendant 30 jours, puis payant
2. **Moins de confusion** : Pas de notion de "trial" vs "free"
3. **Expérience utilisateur claire** : "Vous avez X jours gratuits restants"
4. **Développement simplifié** : Une seule logique de vérification
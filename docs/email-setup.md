# Configuration des Emails Personnalisés

## Problème avec les emails Supabase

Par défaut, Supabase envoie ses propres emails pour :
- Confirmation d'inscription
- Réinitialisation de mot de passe  
- Changement d'email
- Invitation

Ces emails utilisent les templates Supabase, pas nos templates React Email personnalisés.

## Solutions

### Option 1: Personnaliser dans Supabase Dashboard (Simple)

1. Aller dans Supabase Dashboard > Authentication > Email Templates
2. Modifier chaque template avec votre HTML personnalisé
3. Variables disponibles : `{{ .SiteURL }}`, `{{ .Token }}`, `{{ .Email }}`

**Avantages:** Simple à mettre en place
**Inconvénients:** HTML statique, pas de composants React

### Option 2: Désactiver les emails Supabase (Recommandé)

1. **Désactiver les emails automatiques dans Supabase:**
   - Dashboard > Authentication > Email Settings
   - Désactiver "Enable email confirmations"
   - Ou configurer un SMTP personnalisé

2. **Utiliser les endpoints API personnalisés:**
   - `/api/auth/signup` - Inscription avec email de confirmation personnalisé
   - `/api/auth/reset-password` - Réinitialisation avec email personnalisé

3. **Gérer les tokens manuellement:**
   ```typescript
   // Créer une table pour les tokens
   create table auth_tokens (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users(id),
     token text unique not null,
     type text not null, -- 'confirmation' | 'reset'
     expires_at timestamp not null,
     used_at timestamp
   );
   ```

### Option 3: Webhooks Supabase + Resend

1. Créer un webhook Supabase qui écoute les événements auth
2. Intercepter les événements et envoyer vos emails personnalisés
3. Désactiver les emails Supabase originaux

```typescript
// app/api/webhooks/auth/route.ts
export async function POST(request: Request) {
  const { type, user, email } = await request.json();
  
  switch (type) {
    case 'signup':
      await sendEmailConfirmation({ to: email, ... });
      break;
    case 'reset':
      await sendPasswordResetEmail({ to: email, ... });
      break;
  }
}
```

## Configuration Resend

1. Ajouter votre domaine dans Resend Dashboard
2. Configurer les DNS records
3. Mettre à jour `RESEND_API_KEY` dans `.env.local`
4. Modifier `FROM_EMAIL` dans `lib/email.ts`

## Utilisation

```typescript
import { 
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailConfirmation 
} from '@/lib/email';

// Envoyer un email de bienvenue
await sendWelcomeEmail({
  to: 'user@example.com',
  userName: 'John',
  dashboardUrl: 'https://app.hectoranalytics.com'
});
```

## Templates disponibles

- `emails/transactional/welcome.tsx` - Email de bienvenue
- `emails/supabase/reset-password.tsx` - Réinitialisation mot de passe
- `emails/supabase/confirm-signup.tsx` - Confirmation inscription
- `emails/supabase/change-email.tsx` - Changement d'email
- `emails/promotional/trial-ending.tsx` - Fin de période d'essai
- `emails/promotional/upgrade-reminder.tsx` - Rappel de mise à niveau
- `emails/reports/weekly-report.tsx` - Rapport hebdomadaire
- `emails/reports/monthly-report.tsx` - Rapport mensuel
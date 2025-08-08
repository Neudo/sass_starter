-- Migration pour ajouter les colonnes de tracking UTM et pages à la table sessions

-- Ajouter les colonnes UTM pour le tracking des sources
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- Ajouter les colonnes pour le referrer
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS referrer_domain TEXT;

-- Ajouter les colonnes pour le tracking des pages
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS entry_page TEXT,
ADD COLUMN IF NOT EXISTS exit_page TEXT,
ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 1;

-- Créer des index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_sessions_utm_source ON sessions(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_utm_medium ON sessions(utm_medium) WHERE utm_medium IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_utm_campaign ON sessions(utm_campaign) WHERE utm_campaign IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_referrer_domain ON sessions(referrer_domain) WHERE referrer_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_entry_page ON sessions(entry_page);
CREATE INDEX IF NOT EXISTS idx_sessions_exit_page ON sessions(exit_page);

-- Mettre à jour les politiques RLS si nécessaire
-- Les politiques existantes devraient continuer à fonctionner car nous ajoutons seulement des colonnes
-- Ajouter la colonne entry_page à la table page_views
ALTER TABLE public.page_views ADD COLUMN entry_page BOOLEAN DEFAULT FALSE;

-- Créer un index pour les performances
CREATE INDEX idx_page_views_entry_page ON public.page_views(entry_page) WHERE entry_page = true;

-- Marquer les entry pages existantes (première page vue par session)
UPDATE public.page_views 
SET entry_page = true
WHERE id IN (
    SELECT DISTINCT ON (session_id) id 
    FROM public.page_views 
    ORDER BY session_id, created_at ASC
);
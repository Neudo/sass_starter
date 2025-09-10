-- Script de migration des données existantes de visited_pages vers la nouvelle table page_views
-- À exécuter dans Supabase SQL Editor

-- 1. Migration des données existantes
DO $$
DECLARE
    session_record RECORD;
    page_path TEXT;
    migration_count INTEGER := 0;
BEGIN
    -- Parcourir toutes les sessions ayant des pages visitées
    FOR session_record IN 
        SELECT id, site_id, created_at, visited_pages 
        FROM public.sessions 
        WHERE visited_pages IS NOT NULL 
        AND jsonb_array_length(visited_pages) > 0
    LOOP
        -- Pour chaque page dans le tableau visited_pages
        FOR page_path IN 
            SELECT jsonb_array_elements_text(session_record.visited_pages)
        LOOP
            -- Insérer dans la nouvelle table page_views
            INSERT INTO public.page_views (
                session_id,
                site_id,
                page_path,
                created_at
            ) VALUES (
                session_record.id,
                session_record.site_id,
                page_path,
                session_record.created_at
            )
            ON CONFLICT DO NOTHING; -- Éviter les doublons si le script est exécuté plusieurs fois
            
            migration_count := migration_count + 1;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Migration completed: % page views migrated', migration_count;
END $$;

-- 2. Vérification de la migration
SELECT 
    'Sessions with pages' as metric,
    COUNT(*) as count
FROM public.sessions 
WHERE visited_pages IS NOT NULL 
AND jsonb_array_length(visited_pages) > 0

UNION ALL

SELECT 
    'Total page views migrated' as metric,
    COUNT(*) as count
FROM public.page_views;

-- 3. Après vérification, vous pouvez supprimer la colonne visited_pages
-- ALTER TABLE public.sessions DROP COLUMN visited_pages;
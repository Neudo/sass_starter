-- Script pour supprimer l'ancienne colonne visited_pages après migration
-- À exécuter UNIQUEMENT après avoir vérifié que la migration est complète

-- 1. Vérifier que les données ont bien été migrées
SELECT 
    'Sessions avec visited_pages' as metric,
    COUNT(*) as count
FROM public.sessions 
WHERE visited_pages IS NOT NULL 
AND jsonb_array_length(visited_pages) > 0

UNION ALL

SELECT 
    'Total page_views dans nouvelle table' as metric,
    COUNT(*) as count
FROM public.page_views;

-- 2. Si les nombres correspondent et que vous êtes sûr que la migration est complète,
-- décommentez et exécutez la ligne suivante :

-- ALTER TABLE public.sessions DROP COLUMN visited_pages;

-- 3. Optionnel : Vérifier que la colonne a bien été supprimée
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'sessions' 
-- AND table_schema = 'public' 
-- AND column_name = 'visited_pages';
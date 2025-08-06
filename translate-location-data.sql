-- Script de migration pour traduire les données de localisation de français vers anglais
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Traduire les pays de français vers anglais
UPDATE sessions SET country = 'United States' WHERE country = 'États Unis';
UPDATE sessions SET country = 'Australia' WHERE country = 'Australie';
UPDATE sessions SET country = 'Poland' WHERE country = 'Pologne';
UPDATE sessions SET country = 'United Kingdom' WHERE country = 'Royaume-Uni';
UPDATE sessions SET country = 'Saudi Arabia' WHERE country = 'Arabie saoudite';

-- Traduire les régions de français vers anglais
UPDATE sessions SET region = 'Ile-de-France' WHERE region = 'Île-de-France';
UPDATE sessions SET region = 'Virginia' WHERE region = 'Virginie';
UPDATE sessions SET region = 'New South Wales' WHERE region = 'Nouvelle-Galles du Sud';
UPDATE sessions SET region = 'Masovian Voivodeship' WHERE region = 'Voïvodie de Mazovie';
UPDATE sessions SET region = 'England' WHERE region = 'Angleterre';
UPDATE sessions SET region = 'Riyadh Region' WHERE region = 'Riyad';

-- Traduire les villes de français vers anglais
UPDATE sessions SET city = 'Warsaw' WHERE city = 'Varsovie';
UPDATE sessions SET city = 'Riyadh' WHERE city = 'Riyad';

-- Vérifier le résultat
SELECT DISTINCT country, region, city 
FROM sessions 
WHERE country IS NOT NULL OR region IS NOT NULL OR city IS NOT NULL
ORDER BY country, region, city;
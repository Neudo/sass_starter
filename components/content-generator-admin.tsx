/**
 * Admin Interface for Content Generation
 * Dashboard component for managing blog content generation
 */

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Calendar, Zap } from 'lucide-react';
import { articleTopics } from '@/lib/content-generator';

interface GeneratedArticle {
  title: string;
  metaDescription: string;
  slug: string;
  content: string;
  keywords: string[];
  internalLinks: string[];
  readingTime: number;
}

export function ContentGeneratorAdmin() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);
  const [selectedTopic, setSelectedTopic] = useState(articleTopics[0]);
  const [customKeywords, setCustomKeywords] = useState('');

  const generateArticle = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate',
          topic: selectedTopic.topic,
          primaryKeyword: selectedTopic.primaryKeyword,
          secondaryKeywords: [
            ...selectedTopic.secondaryKeywords,
            ...customKeywords.split(',').map(k => k.trim()).filter(Boolean)
          ],
          targetLength: selectedTopic.targetLength,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setGeneratedArticle(result.article);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error generating article:', error);
      alert('Erreur lors de la génération de l\'article');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContentCalendar = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'calendar',
          topic: 'all topics',
          primaryKeyword: '',
          secondaryKeywords: [],
          targetLength: 0,
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('Content calendar:', result.calendar);
        alert('Calendrier généré ! Voir la console pour les détails.');
      }
    } catch (error) {
      console.error('Error generating calendar:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Générateur de Contenu SEO</h1>
        <Badge variant="secondary">Hector Analytics Blog</Badge>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Générer Article</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          <TabsTrigger value="optimize">Optimiser</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Configuration</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic-select">Sujet d'article</Label>
                  <select
                    id="topic-select"
                    className="w-full p-2 border rounded-md"
                    value={articleTopics.indexOf(selectedTopic)}
                    onChange={(e) => setSelectedTopic(articleTopics[parseInt(e.target.value)])}
                  >
                    {articleTopics.map((topic, index) => (
                      <option key={index} value={index}>
                        {topic.topic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="primary-keyword">Mot-clé principal</Label>
                  <Input
                    id="primary-keyword"
                    value={selectedTopic.primaryKeyword}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="secondary-keywords">Mots-clés secondaires</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedTopic.secondaryKeywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom-keywords">Mots-clés additionnels (séparés par des virgules)</Label>
                  <Input
                    id="custom-keywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={customKeywords}
                    onChange={(e) => setCustomKeywords(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Longueur cible</Label>
                  <div className="text-sm text-muted-foreground">
                    {selectedTopic.targetLength} mots (~{Math.ceil(selectedTopic.targetLength / 250)} min de lecture)
                  </div>
                </div>

                <Button 
                  onClick={generateArticle} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Générer l'Article
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Aperçu du résultat */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Aperçu</h2>
              {generatedArticle ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">TITRE</h3>
                    <p className="font-semibold">{generatedArticle.title}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">META DESCRIPTION</h3>
                    <p className="text-sm">{generatedArticle.metaDescription}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">SLUG</h3>
                    <code className="text-xs bg-muted px-2 py-1 rounded">/blog/{generatedArticle.slug}/</code>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">MOTS-CLÉS</h3>
                    <div className="flex flex-wrap gap-1">
                      {generatedArticle.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>📖 {generatedArticle.readingTime} min de lecture</span>
                    <span>🔗 {generatedArticle.internalLinks.length} liens internes</span>
                  </div>

                  <Button variant="outline" className="w-full">
                    Voir le Contenu Complet
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Générez un article pour voir l'aperçu
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Calendrier de Contenu SEO</h2>
              <Button onClick={generateContentCalendar} disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Générer Calendrier 3 Mois
              </Button>
            </div>
            
            <div className="grid gap-4">
              {articleTopics.map((topic, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{topic.topic}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>🎯 {topic.primaryKeyword}</span>
                    <span>📝 {topic.targetLength} mots</span>
                    <Badge variant="outline">Priorité SEO: Élevée</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="optimize">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Optimisation SEO</h2>
            <p className="text-muted-foreground">
              Fonctionnalité d'optimisation d'articles existants - À implémenter
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
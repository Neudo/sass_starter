"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Eye, Edit, Bot, Clock, CheckCircle } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  meta_description: string;
  keywords: string[];
  status: "draft" | "published" | "scheduled";
  generated_by_ai: boolean;
  reading_time: number;
  seo_score: number;
  created_at: string;
  updated_at: string;
  view_count: number;
}

export default function BlogAdminDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom article form
  const [customTopic, setCustomTopic] = useState("");
  const [customKeyword, setCustomKeyword] = useState("");
  const [customTone, setCustomTone] = useState<"professional" | "friendly" | "technical">("professional");
  const [customLength, setCustomLength] = useState<"short" | "medium" | "long">("medium");
  const [includeCode, setIncludeCode] = useState(false);

  useEffect(() => {
    loadPosts();
    loadTopics();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch("/api/generate-content?action=posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
      setError("Impossible de charger les articles");
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async () => {
    try {
      const response = await fetch("/api/generate-content?action=topics");
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error("Failed to load topics:", error);
    }
  };

  const generateArticle = async (topic: any) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CONTENT_API_KEY || "dev-key"}`,
        },
        body: JSON.stringify(topic),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la génération");
      }

      const data = await response.json();
      console.log("Article généré:", data.article);
      
      // Reload posts to show the new one
      await loadPosts();
      
      // Clear form
      if (!selectedTopic) {
        setCustomTopic("");
        setCustomKeyword("");
      }
      setSelectedTopic(null);

    } catch (error) {
      console.error("Generation failed:", error);
      setError(error instanceof Error ? error.message : "Erreur de génération");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickGenerate = (topic: any) => {
    generateArticle(topic);
  };

  const handleCustomGenerate = () => {
    if (!customTopic || !customKeyword) {
      setError("Le sujet et le mot-clé sont requis");
      return;
    }

    const customTopicData = {
      topic: customTopic,
      keyword: customKeyword,
      tone: customTone,
      length: customLength,
      includeCode,
    };

    generateArticle(customTopicData);
  };

  const updatePostStatus = async (postId: string, status: "draft" | "published" | "scheduled") => {
    try {
      // Implementation would require a separate API endpoint
      console.log("Update post status:", postId, status);
      // For now, just reload posts
      await loadPosts();
    } catch (error) {
      console.error("Failed to update post status:", error);
    }
  };

  const getStatusIcon = (status: string, generated_by_ai: boolean) => {
    if (status === "published") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "scheduled") return <Clock className="h-4 w-4 text-blue-500" />;
    return <Edit className="h-4 w-4 text-yellow-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Blog - Hector Analytics</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            <Bot className="h-3 w-3 mr-1" />
            Génération IA activée
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-700">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Publiés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {posts.filter(p => p.status === "published").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Brouillons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {posts.filter(p => p.status === "draft").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Générés par IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {posts.filter(p => p.generated_by_ai).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Génération Rapide d'Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {topics.map((topic, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-sm mb-2">{topic.topic}</h3>
                <div className="text-xs text-gray-600 mb-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {topic.keyword}
                  </span>
                  <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {topic.length}
                  </span>
                </div>
                <Button
                  onClick={() => handleQuickGenerate(topic)}
                  disabled={isGenerating}
                  size="sm"
                  className="w-full"
                >
                  {isGenerating ? "Génération..." : "Générer"}
                </Button>
              </Card>
            ))}
          </div>

          {/* Custom Article Form */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Article Personnalisé</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="custom-topic">Sujet de l'article</Label>
                <Textarea
                  id="custom-topic"
                  placeholder="Ex: Guide complet du tracking sans cookies"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-keyword">Mot-clé principal</Label>
                <Input
                  id="custom-keyword"
                  placeholder="Ex: analytics sans cookies"
                  value={customKeyword}
                  onChange={(e) => setCustomKeyword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ton</Label>
                <Select value={customTone} onValueChange={(value: any) => setCustomTone(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professionnel</SelectItem>
                    <SelectItem value="friendly">Accessible</SelectItem>
                    <SelectItem value="technical">Technique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Longueur</Label>
                <Select value={customLength} onValueChange={(value: any) => setCustomLength(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Court (1000-1500 mots)</SelectItem>
                    <SelectItem value="medium">Moyen (2000-2500 mots)</SelectItem>
                    <SelectItem value="long">Long (3000-4000 mots)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="include-code"
                checked={includeCode}
                onChange={(e) => setIncludeCode(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="include-code">Inclure des exemples de code</Label>
            </div>
            <Button 
              onClick={handleCustomGenerate} 
              disabled={isGenerating || !customTopic || !customKeyword}
              className="mt-4"
            >
              {isGenerating ? "Génération..." : "Générer Article Personnalisé"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle>Articles Récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucun article généré. Commencez par créer votre premier article !</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(post.status, post.generated_by_ai)}
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      {post.generated_by_ai && (
                        <Badge variant="secondary" className="text-xs">
                          <Bot className="h-3 w-3 mr-1" />
                          IA
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📖 {post.reading_time} min de lecture</span>
                      <span>🎯 SEO: {post.seo_score}/100</span>
                      <span>👁️ {post.view_count} vues</span>
                      <span>📅 {new Date(post.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.keywords.slice(0, 3).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {post.status === "draft" && (
                      <Button 
                        onClick={() => updatePostStatus(post.id, "published")}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Publier
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
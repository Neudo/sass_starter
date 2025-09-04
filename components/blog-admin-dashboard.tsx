"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Edit,
  Bot,
  CheckCircle,
  Trash2,
  ExternalLink,
  Plus,
  Copy,
} from "lucide-react";
import BlogPreviewModal from "./blog-preview-modal";
import BlogEditModal from "./blog-edit-modal";
import BlogRewriteModal from "./blog-rewrite-modal";
import { BlogPost } from "@/types";

interface GenerateArticleOptions {
  topic: string;
  keyword: string;
  tone?: "professional" | "friendly" | "technical";
  length?: "short" | "medium" | "long";
  includeCode?: boolean;
}

export default function BlogAdminDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [topics, setTopics] = useState<GenerateArticleOptions[]>([]);
  const [selectedTopic, setSelectedTopic] =
    useState<GenerateArticleOptions | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRewriteOpen, setIsRewriteOpen] = useState(false);

  // Custom article form
  const [customTopic, setCustomTopic] = useState("");
  const [customKeyword, setCustomKeyword] = useState("");
  const [customTone, setCustomTone] = useState<
    "professional" | "friendly" | "technical"
  >("professional");
  const [customLength, setCustomLength] = useState<"short" | "medium" | "long">(
    "medium"
  );
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

  const generateArticle = async (topic: GenerateArticleOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(topic),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la génération");
      }

      await response.json();

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

  const handleQuickGenerate = (topic: GenerateArticleOptions) => {
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

  const updatePostStatus = async (
    postId: string,
    status: "draft" | "published" | "scheduled"
  ) => {
    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          ...(status === "published" && {
            published_at: new Date().toISOString(),
          }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      // Reload posts to show updated status
      await loadPosts();
      setError(null);
    } catch (error) {
      console.error("Failed to update post status:", error);
      setError(
        error instanceof Error ? error.message : "Erreur lors de la mise à jour"
      );
    }
  };

  const handlePreview = (post: BlogPost) => {
    setPreviewPost(post);
    setIsPreviewOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditPost(post);
    setIsEditOpen(true);
  };

  const handleCreateNew = () => {
    // Create a new empty post template
    const newPost: BlogPost = {
      id: "new",
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      meta_description: "",
      keywords: [],
      status: "draft",
      generated_by_ai: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEditPost(newPost);
    setIsEditOpen(true);
  };

  const handleOpenRewrite = () => {
    setIsRewriteOpen(true);
  };

  const handleRewrite = (rewrittenArticle: {
    title: string;
    content: string;
    keywords: string[];
  }) => {
    // Create a new post with the rewritten content
    const newPost: BlogPost = {
      id: "new",
      title: rewrittenArticle.title,
      slug: "",
      content: rewrittenArticle.content,
      excerpt: "",
      meta_description: "",
      keywords: rewrittenArticle.keywords,
      status: "draft",
      generated_by_ai: true, // Mark as AI-generated
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEditPost(newPost);
    setIsEditOpen(true);
  };

  const handleSave = async (updatedData: Partial<BlogPost>) => {
    if (!editPost) return;

    try {
      const isNewPost = editPost.id === "new";
      const url = isNewPost ? "/api/blog" : `/api/blog/${editPost.id}`;
      const method = isNewPost ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save changes");
      }

      // Reload posts to show changes
      await loadPosts();
      setError(null);
    } catch (error) {
      console.error("Failed to save post:", error);
      throw new Error(
        error instanceof Error ? error.message : "Erreur lors de la sauvegarde"
      );
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete post");
      }

      // Reload posts to remove deleted one
      await loadPosts();
      setError(null);
    } catch (error) {
      console.error("Failed to delete post:", error);
      setError(
        error instanceof Error ? error.message : "Erreur lors de la suppression"
      );
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "published")
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "scheduled")
      return <Edit className="h-4 w-4 text-blue-500" />;
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
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Blog - Hector Analytics
        </h1>
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
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Publiés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {posts.filter((p) => p.status === "published").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Brouillons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {posts.filter((p) => p.status === "draft").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Générés par IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {posts.filter((p) => p.generated_by_ai).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Génération Rapide d&apos;Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {topics.map((topic, index) => (
              <Card
                key={index}
                className="p-4 hover:shadow-md transition-shadow"
              >
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
                <Label htmlFor="custom-topic">Sujet de l&apos;article</Label>
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
                <Select
                  value={customTone}
                  onValueChange={(
                    value: "professional" | "friendly" | "technical"
                  ) => setCustomTone(value)}
                >
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
                <Select
                  value={customLength}
                  onValueChange={(value: "short" | "medium" | "long") =>
                    setCustomLength(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">
                      Court (1000-1500 mots)
                    </SelectItem>
                    <SelectItem value="medium">
                      Moyen (2000-2500 mots)
                    </SelectItem>
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
          <div className="flex justify-between items-center">
            <CardTitle>Articles Récents</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleOpenRewrite}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />À partir d&apos;un article
              </Button>
              <Button
                onClick={handleCreateNew}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nouvel Article
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>
                  Aucun article généré. Commencez par créer votre premier
                  article !
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(post.status)}
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
                      <span>
                        📅{" "}
                        {new Date(post.created_at).toLocaleDateString("en-US")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.keywords.slice(0, 3).map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(post)}
                      title="Prévisualiser"
                    >
                      👁️
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(post)}
                      title="Éditer"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {post.status === "published" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(`/blog/${post.slug}`, "_blank")
                        }
                        title="Voir en ligne"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => updatePostStatus(post.id, "published")}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        title="Publier"
                      >
                        Publier
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <BlogPreviewModal
        post={previewPost}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewPost(null);
        }}
      />

      <BlogEditModal
        post={editPost}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditPost(null);
        }}
        onSave={handleSave}
      />

      <BlogRewriteModal
        isOpen={isRewriteOpen}
        onClose={() => setIsRewriteOpen(false)}
        onRewrite={handleRewrite}
      />
    </div>
  );
}

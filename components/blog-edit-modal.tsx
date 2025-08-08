"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Save, X } from "lucide-react";

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
  published_at?: string;
}

interface BlogEditModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: Partial<BlogPost>) => Promise<void>;
}

export default function BlogEditModal({
  post,
  isOpen,
  onClose,
  onSave,
}: BlogEditModalProps) {
  const [formData, setFormData] = useState<Partial<BlogPost>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keywordsInput, setKeywordsInput] = useState("");

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        meta_description: post.meta_description,
        keywords: post.keywords,
        status: post.status,
      });
      setKeywordsInput(post.keywords.join(", "));
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setIsSaving(true);
    setError(null);

    try {
      // Parse keywords from input
      const keywords = keywordsInput
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const updateData = {
        ...formData,
        keywords,
        // Auto-generate slug if title changed
        slug: formData.slug || generateSlug(formData.title || ""),
      };

      await onSave(updateData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleInputChange = (field: keyof BlogPost, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Auto-calculate reading time when content changes
      ...(field === "content" && {
        reading_time: calculateReadingTime(value),
      }),
    }));

    // Auto-generate slug when title changes
    if (field === "title" && value) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Éditer l&apos;article</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l&apos;article et sauvegardez les
            changements.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <div className="font-medium text-red-800">Erreur</div>
              <div className="text-red-700">{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Titre de l&apos;article</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Titre de l'article"
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">URL slug</Label>
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                placeholder="url-slug-seo-friendly"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                URL finale : /blog/{formData.slug}
              </div>
            </div>

            <div>
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "draft" | "published" | "scheduled") =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="scheduled">Programmé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SEO Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="excerpt">Résumé</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt || ""}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
                placeholder="Résumé de l'article (150-160 caractères)"
                rows={3}
                maxLength={160}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.excerpt?.length || 0}/160 caractères
              </div>
            </div>

            <div>
              <Label htmlFor="meta_description">Meta description</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description || ""}
                onChange={(e) =>
                  handleInputChange("meta_description", e.target.value)
                }
                placeholder="Description pour les moteurs de recherche (150-155 caractères)"
                rows={2}
                maxLength={155}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.meta_description?.length || 0}/155 caractères
              </div>
            </div>

            <div>
              <Label htmlFor="keywords">Mots-clés</Label>
              <Input
                id="keywords"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="mot-clé 1, mot-clé 2, mot-clé 3"
              />
              <div className="text-xs text-gray-500 mt-1">
                Séparez les mots-clés par des virgules
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Contenu HTML</Label>
            <Textarea
              id="content"
              value={formData.content || ""}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Contenu HTML de l'article"
              rows={15}
              className="font-mono text-sm"
            />
            <div className="text-xs text-gray-500 mt-1 flex justify-between">
              <span>
                Temps de lecture estimé : {calculateReadingTime(formData.content || "")} minutes
              </span>
              <span>
                {formData.content?.length || 0} caractères
              </span>
            </div>
          </div>

          {/* Current Keywords Preview */}
          {keywordsInput && (
            <div>
              <Label>Aperçu des mots-clés</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {keywordsInput
                  .split(",")
                  .map((keyword) => keyword.trim())
                  .filter((k) => k.length > 0)
                  .map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
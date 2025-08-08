"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Eye, ExternalLink } from "lucide-react";

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

interface BlogPreviewModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BlogPreviewModal({
  post,
  isOpen,
  onClose,
}: BlogPreviewModalProps) {
  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Aperçu de l&apos;article
            </DialogTitle>
            <div className="flex items-center gap-2">
              {post.status === "published" && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir en ligne
                  </a>
                </Button>
              )}
            </div>
          </div>
          <DialogDescription>
            Prévisualisation de l&apos;article tel qu&apos;il apparaîtra sur le blog
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Article Meta Info */}
          <div className="border-b pb-4">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.reading_time} min de lecture
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.view_count} vues
              </span>
              <Badge
                variant={
                  post.status === "published"
                    ? "default"
                    : post.status === "draft"
                    ? "secondary"
                    : "outline"
                }
              >
                {post.status === "published"
                  ? "Publié"
                  : post.status === "draft"
                  ? "Brouillon"
                  : "Programmé"}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            <p className="text-lg text-gray-600 mb-4">{post.excerpt}</p>

            <div className="flex flex-wrap gap-2">
              {post.keywords.slice(0, 5).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* SEO Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              Informations SEO
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-blue-800">URL : </span>
                <span className="text-blue-600">/blog/{post.slug}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">
                  Meta description :{" "}
                </span>
                <span className="text-blue-600">{post.meta_description}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Score SEO : </span>
                <span className="text-blue-600">{post.seo_score}/100</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="bg-white border rounded-lg p-6">
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            {post.status === "published" && (
              <Button variant="default" asChild>
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir en ligne
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
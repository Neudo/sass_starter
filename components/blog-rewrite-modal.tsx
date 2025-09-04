"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Copy, 
  Loader2, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  Link,
  Wand2
} from "lucide-react";

interface BlogRewriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewrite: (article: {
    title: string;
    content: string;
    keywords: string[];
  }) => void;
}

export default function BlogRewriteModal({
  isOpen,
  onClose,
  onRewrite,
}: BlogRewriteModalProps) {
  const [sourceType, setSourceType] = useState<"url" | "text">("url");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedContent, setExtractedContent] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const handleAnalyze = async () => {
    setError(null);
    setIsAnalyzing(true);

    try {
      if (sourceType === "url" && !sourceUrl) {
        throw new Error("Veuillez entrer une URL");
      }
      if (sourceType === "text" && !sourceText) {
        throw new Error("Veuillez coller le contenu de l'article");
      }

      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "extract",
          source: sourceType === "url" ? sourceUrl : sourceText,
          sourceType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'extraction");
      }

      const data = await response.json();
      setExtractedContent({
        title: data.title || "Article sans titre",
        content: data.content || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRewrite = async () => {
    if (!extractedContent) return;
    
    setError(null);
    setIsRewriting(true);

    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "rewrite",
          originalTitle: extractedContent.title,
          originalContent: extractedContent.content,
          targetService: "Hector Analytics",
          style: "professional",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la réécriture");
      }

      const data = await response.json();
      
      // Pass the rewritten article to the parent component
      onRewrite({
        title: data.article.title,
        content: data.article.content,
        keywords: data.article.keywords || [],
      });
      
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la réécriture");
    } finally {
      setIsRewriting(false);
    }
  };

  const handleClose = () => {
    setSourceUrl("");
    setSourceText("");
    setExtractedContent(null);
    setError(null);
    setSourceType("url");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Créer un article à partir d'un autre article
          </DialogTitle>
          <DialogDescription>
            Importez un article existant et réécrivez-le automatiquement pour Hector Analytics.
            Le contenu sera adapté tout en conservant le message principal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Source Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={sourceType === "url" ? "default" : "outline"}
              onClick={() => setSourceType("url")}
              className="justify-start"
            >
              <Link className="h-4 w-4 mr-2" />
              Depuis une URL
            </Button>
            <Button
              type="button"
              variant={sourceType === "text" ? "default" : "outline"}
              onClick={() => setSourceType("text")}
              className="justify-start"
            >
              <FileText className="h-4 w-4 mr-2" />
              Coller le texte
            </Button>
          </div>

          {/* Input Based on Source Type */}
          {sourceType === "url" ? (
            <div className="space-y-2">
              <Label htmlFor="source-url">URL de l'article source</Label>
              <Input
                id="source-url"
                type="url"
                placeholder="https://example.com/article"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                disabled={isAnalyzing || isRewriting}
              />
              <p className="text-xs text-muted-foreground">
                Entrez l'URL complète de l'article que vous voulez réécrire
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="source-text">Contenu de l'article source</Label>
              <Textarea
                id="source-text"
                placeholder="Collez ici le contenu de l'article à réécrire..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={8}
                disabled={isAnalyzing || isRewriting}
              />
              <p className="text-xs text-muted-foreground">
                Copiez-collez le texte complet de l'article source
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Extracted Content Preview */}
          {extractedContent && !isRewriting && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-semibold text-sm mb-2">Contenu extrait :</h4>
              <p className="font-medium mb-2">{extractedContent.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {extractedContent.content.substring(0, 200)}...
              </p>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>📝 Ce qui sera fait :</strong>
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                  <li>• Adaptation du contenu pour Hector Analytics</li>
                  <li>• Réécriture complète avec un vocabulaire différent</li>
                  <li>• Conservation du message principal</li>
                  <li>• Ajout/suppression de sections si pertinent</li>
                  <li>• Optimisation SEO pour votre service</li>
                </ul>
              </div>
            </div>
          )}

          {/* Rewriting Progress */}
          {isRewriting && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Réécriture en cours pour Hector Analytics...
              </p>
              <p className="text-xs text-muted-foreground">
                Cela peut prendre 30-60 secondes
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isAnalyzing || isRewriting}
          >
            Annuler
          </Button>

          {!extractedContent ? (
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!sourceUrl && !sourceText)}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyse...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Analyser l'article
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleRewrite}
              disabled={isRewriting}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {isRewriting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Réécriture...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Réécrire pour Hector Analytics
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
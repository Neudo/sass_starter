"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Edit, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { markdownToHtml, htmlToMarkdown } from "@/lib/markdown-utils";

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string, html: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  initialMode?: "markdown" | "html";
}

export default function MarkdownEditor({
  value,
  onChange,
  label = "Contenu",
  placeholder = "Écrivez votre article en Markdown...",
  className,
  initialMode = "markdown",
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"markdown" | "html">(initialMode);
  const [markdownContent, setMarkdownContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  // Initialize content based on current value
  useEffect(() => {
    if (value) {
      // Detect if the value is HTML or Markdown
      const isHtml = value.includes("<") && value.includes(">");

      if (isHtml) {
        setHtmlContent(value);
        // Convert HTML to Markdown for editing
        const markdown = htmlToMarkdown(value);
        setMarkdownContent(markdown);
      } else {
        setMarkdownContent(value);
        // Convert Markdown to HTML
        const html = markdownToHtml(value);
        setHtmlContent(html);
      }
    } else {
      setMarkdownContent("");
      setHtmlContent("");
    }
  }, [value]);

  const handleMarkdownChange = async (newMarkdown: string = "") => {
    setMarkdownContent(newMarkdown);
    const html = markdownToHtml(newMarkdown);
    setHtmlContent(html);
    onChange(newMarkdown, html);
  };

  const handleHtmlChange = (newHtml: string) => {
    setHtmlContent(newHtml);
    const markdown = htmlToMarkdown(newHtml);
    setMarkdownContent(markdown);
    onChange(markdown, newHtml);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}

      <Tabs
        value={mode}
        onValueChange={(value) => setMode(value as "markdown" | "html")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="markdown" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Markdown
          </TabsTrigger>
          <TabsTrigger value="html" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            HTML
          </TabsTrigger>
        </TabsList>

        <TabsContent value="markdown" className="mt-4">
          <div className="border rounded-lg overflow-hidden">
            <MDEditor
              value={markdownContent}
              onChange={handleMarkdownChange}
              data-color-mode="light"
              height={400}
              preview="edit"
              hideToolbar={false}
              textareaProps={{
                placeholder: placeholder,
                style: {
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                },
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-2 space-y-1">
            <p>
              💡 <strong>Conseils Markdown :</strong>
            </p>
            <p>
              • Utilisez <code># Titre</code> pour les titres,{" "}
              <code>**gras**</code> pour le gras
            </p>
            <p>
              • <code>[lien](url)</code> pour les liens,{" "}
              <code>![alt](image.jpg)</code> pour les images
            </p>
            <p>
              • <code>```code```</code> pour les blocs de code
            </p>
          </div>
        </TabsContent>

        <TabsContent value="html" className="mt-4">
          <div className="space-y-4">
            <div className="border rounded-lg">
              <textarea
                value={htmlContent}
                onChange={(e) => handleHtmlChange(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm border-0 resize-none focus:outline-none focus:ring-0"
                placeholder="Contenu HTML de l'article..."
              />
            </div>

            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                <Eye className="h-4 w-4" />
                Aperçu
              </div>
              <div
                className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-pre:bg-muted prose-pre:text-foreground"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>
          {mode === "markdown" ? markdownContent.length : htmlContent.length}{" "}
          caractères
        </span>
        <span>
          Temps de lecture estimé :{" "}
          {Math.ceil(
            markdownContent.replace(/[^\w\s]/g, "").split(/\s+/).length / 200
          )}{" "}
          min
        </span>
      </div>
    </div>
  );
}

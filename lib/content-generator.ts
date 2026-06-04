/**
 * Editorial content generator for Hector Analytics.
 *
 * This keeps the existing admin blog API intact while removing the old
 * clone-style content workflow.
 */

import { BlogPost } from "@/types";
import { createAdminClient } from "./supabase/admin";

interface GenerateArticleOptions {
  topic: string;
  keyword: string;
  tone?: "professional" | "friendly" | "technical";
  length?: "short" | "medium" | "long";
  includeCode?: boolean;
}

interface RewriteArticleOptions {
  originalTitle: string;
  originalContent: string;
  targetService: string;
  style?: "professional" | "friendly" | "technical";
}

export class ContentGenerator {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
    this.model = process.env.OPENAI_CONTENT_MODEL || "gpt-4.1-mini";

    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
  }

  async generateArticle(options: GenerateArticleOptions): Promise<BlogPost> {
    const content = await this.callOpenAI({
      system:
        "Tu es un stratège éditorial B2B SaaS. Tu écris des brouillons utiles, précis et révisables, jamais du contenu cloné ou promotionnel.",
      prompt: this.createArticlePrompt(options),
      maxTokens: 6000,
      temperature: 0.65,
    });

    return this.formatBlogPost(this.parseJsonResponse(content));
  }

  async rewriteArticle(options: RewriteArticleOptions): Promise<BlogPost> {
    const content = await this.callOpenAI({
      system:
        "Tu réécris des contenus SaaS en brouillons éditoriaux originaux, avec une structure nouvelle et un angle produit sobre.",
      prompt: this.createRewritePrompt(options),
      maxTokens: 6000,
      temperature: 0.7,
    });

    return this.formatBlogPost(this.parseJsonResponse(content));
  }

  async saveToBlog(blogPost: BlogPost, authorId?: string): Promise<string> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        title: blogPost.title,
        slug: blogPost.slug,
        content: blogPost.content,
        excerpt: blogPost.excerpt,
        meta_description: blogPost.meta_description,
        keywords: blogPost.keywords,
        author_id: authorId,
        generated_by_ai: true,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save blog post: ${error.message}`);
    }

    return data.id;
  }

  static getTopicIdeas(): GenerateArticleOptions[] {
    return [
      {
        topic: "Pourquoi vos visiteurs viennent mais ne convertissent pas",
        keyword: "analyse conversion site web",
        tone: "professional",
        length: "medium",
        includeCode: false,
      },
      {
        topic: "Mesurer les pages qui créent vraiment des opportunités",
        keyword: "pages qui convertissent",
        tone: "professional",
        length: "medium",
        includeCode: false,
      },
      {
        topic: "Comprendre l'origine des leads sans accepter un bandeau cookies",
        keyword: "tracking leads sans cookies",
        tone: "technical",
        length: "long",
        includeCode: true,
      },
      {
        topic: "Ce que Google Analytics cache aux petites équipes marketing",
        keyword: "analytics pour petite equipe marketing",
        tone: "friendly",
        length: "medium",
        includeCode: false,
      },
      {
        topic: "Suivre un tunnel de conversion sans complexifier son site",
        keyword: "suivi tunnel conversion",
        tone: "technical",
        length: "long",
        includeCode: true,
      },
    ];
  }

  private async callOpenAI(options: {
    system: string;
    prompt: string;
    maxTokens: number;
    temperature: number;
  }): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: options.system },
          { role: "user", content: options.prompt },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI response did not contain message content");
    }

    return content;
  }

  private createArticlePrompt(options: GenerateArticleOptions): string {
    const lengthWords = {
      short: "1000-1500",
      medium: "1800-2400",
      long: "2600-3400",
    };

    return `Crée un brouillon d'article pour Hector Analytics.

But éditorial:
- Aider les fondateurs, freelances, consultants SEO/marketing et petites équipes SaaS à comprendre ce qui transforme des visites en décisions.
- Se différencier des clones de Plausible: ne pas écrire "alternative privacy-first" comme angle principal par défaut.
- Partir de problèmes métier: conversion, acquisition, sources de leads, pages qui performent, tunnels, qualité du trafic.
- Mentionner Hector Analytics seulement quand c'est utile, sobrement, jamais comme miracle.

Paramètres:
- Sujet: ${options.topic}
- Requête cible: ${options.keyword}
- Ton: ${options.tone || "professional"}
- Longueur: ${lengthWords[options.length || "medium"]} mots
${options.includeCode ? "- Inclure un exemple de tracking concret" : ""}

Contraintes:
- Titre précis, non générique.
- Angle fort dès l'introduction.
- H1/H2/H3 en HTML.
- Inclure les limites et arbitrages.
- Ne pas copier le style Plausible.
- Ne pas produire une page "alternative à Google Analytics" sauf si le sujet le demande.
- Retourner uniquement un JSON valide.

Format JSON:
{
  "title": "Titre exact",
  "slug": "slug-url",
  "content": "HTML complet",
  "excerpt": "Résumé en 150-160 caractères",
  "metaDescription": "Meta description en 150-155 caractères",
  "keywords": ["requête principale", "requête secondaire"]
}`;
  }

  private createRewritePrompt(options: RewriteArticleOptions): string {
    return `Réécris ce contenu pour ${options.targetService}, mais comme un article original.

Titre original:
${options.originalTitle}

Contenu original:
${options.originalContent.substring(0, 6000)}

Objectif:
- Changer l'angle, la structure et les formulations.
- Garder uniquement les idées utiles.
- Transformer le texte en brouillon éditorial pour Hector Analytics.
- Ton: ${options.style || "professional"}.
- Ne pas imiter Plausible ou une autre marque.
- Ne pas mettre ${options.targetService} dans le titre.
- Retourner uniquement un JSON valide.

Format JSON:
{
  "title": "Titre exact",
  "slug": "slug-url",
  "content": "HTML complet",
  "excerpt": "Résumé en 150-160 caractères",
  "metaDescription": "Meta description en 150-155 caractères",
  "keywords": ["requête principale", "requête secondaire"]
}`;
  }

  private parseJsonResponse(content: string): Record<string, unknown> {
    const cleanContent = content
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "");

    try {
      return JSON.parse(cleanContent);
    } catch {
      const jsonStart = cleanContent.indexOf("{");
      const jsonEnd = cleanContent.lastIndexOf("}");

      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        return JSON.parse(cleanContent.slice(jsonStart, jsonEnd + 1));
      }

      throw new Error("Failed to parse AI response as JSON");
    }
  }

  private formatBlogPost(parsed: Record<string, unknown>): BlogPost {
    const title = this.asString(parsed.title) || "Article sans titre";
    const content = this.asString(parsed.content) || "<p>Contenu à compléter.</p>";

    return {
      id: "temp-id",
      title,
      content,
      excerpt: this.asString(parsed.excerpt),
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.filter((keyword): keyword is string => {
            return typeof keyword === "string";
          })
        : [],
      meta_description:
        this.asString(parsed.metaDescription) ||
        this.asString(parsed.meta_description),
      slug: this.asString(parsed.slug) || this.generateSlug(title),
      status: "draft",
      generated_by_ai: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private asString(value: unknown): string {
    return typeof value === "string" ? value : "";
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 70);
  }
}

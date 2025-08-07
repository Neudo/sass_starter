/**
 * Content Generator for Hector Analytics Blog
 * Automated SEO-optimized article generation using Claude API
 */

import { createAdminClient } from "./supabase/admin";

interface BlogPost {
  title: string;
  content: string;
  excerpt: string;
  keywords: string[];
  metaDescription: string;
  slug: string;
  readingTime: number;
  seoScore: number;
}

interface GenerateArticleOptions {
  topic: string;
  keyword: string;
  tone?: "professional" | "friendly" | "technical";
  length?: "short" | "medium" | "long";
  includeCode?: boolean;
}

export class ContentGenerator {
  private anthropicApiKey: string;

  constructor() {
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY || "";
    if (!this.anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is required");
    }
  }

  async generateArticle(options: GenerateArticleOptions): Promise<BlogPost> {
    const prompt = this.createPrompt(options);
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0].text;

      // Parse the structured response
      return this.parseResponse(content);
    } catch (error) {
      console.error("Error generating article:", error);
      throw error;
    }
  }

  private createPrompt(options: GenerateArticleOptions): string {
    const lengthWords = {
      short: "1000-1500",
      medium: "2000-2500", 
      long: "3000-4000"
    };

    return `Tu es un expert en rédaction SEO et marketing digital spécialisé dans les analytics web et la privacy. 

Écris un article de blog complet pour Hector Analytics, une alternative privacy-first à Google Analytics.

PARAMÈTRES:
- Sujet: ${options.topic}
- Mot-clé principal: ${options.keyword}
- Ton: ${options.tone || "professional"}
- Longueur: ${lengthWords[options.length || "medium"]} mots
${options.includeCode ? "- Inclure des exemples de code pratiques" : ""}

CONTEXTE HECTOR ANALYTICS:
- Alternative privacy-first à Google Analytics
- Sans cookies, conformité RGPD automatique
- Script ultra-léger (<1KB)
- Setup en 2 minutes
- Interface simple pour débutants
- Prix abordable
- Domaine: hectoranalytics.com

STRUCTURE REQUISE:
1. Titre accrocheur (avec le mot-clé principal)
2. Introduction engageante (problème + solution)
3. 4-6 sections principales avec sous-titres H2/H3
4. Conclusion avec CTA vers Hector Analytics
5. FAQ (3-5 questions)

OPTIMISATION SEO:
- Utiliser le mot-clé principal dans le titre, intro, et 2-3 fois dans le contenu
- Ajouter des mots-clés sémantiques liés
- Structure avec balises H1, H2, H3
- Meta description accrocheuse (155 caractères max)
- URL slug SEO-friendly

RÉPONSE ATTENDUE (FORMAT JSON):
\`\`\`json
{
  "title": "Titre exact de l'article",
  "slug": "url-slug-seo-friendly", 
  "content": "Contenu HTML complet avec balises <h1>, <h2>, <h3>, <p>, <ul>, <li>, etc.",
  "excerpt": "Résumé engageant de 150-160 caractères",
  "metaDescription": "Meta description SEO de 150-155 caractères",
  "keywords": ["mot-clé principal", "mot-clé secondaire 1", "mot-clé secondaire 2", "etc"],
  "readingTime": 8,
  "seoScore": 85
}
\`\`\`

L'article doit être informatif, engageant et naturellement mentionner Hector Analytics comme solution aux problèmes évoqués. Évite le sur-marketing, privilégie la valeur éducative.`;
  }

  private parseResponse(content: string): BlogPost {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[1]);
      
      return {
        title: parsed.title,
        content: parsed.content,
        excerpt: parsed.excerpt,
        keywords: parsed.keywords || [],
        metaDescription: parsed.metaDescription,
        slug: parsed.slug,
        readingTime: parsed.readingTime || this.calculateReadingTime(parsed.content),
        seoScore: parsed.seoScore || 75,
      };
    } catch (error) {
      console.error("Error parsing response:", error);
      throw new Error("Failed to parse AI response");
    }
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
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
        meta_description: blogPost.metaDescription,
        keywords: blogPost.keywords,
        reading_time: blogPost.readingTime,
        seo_score: blogPost.seoScore,
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

  // Predefined topics for automated generation
  static getTopicIdeas(): GenerateArticleOptions[] {
    return [
      {
        topic: "Guide complet des analytics sans cookies en 2025",
        keyword: "analytics sans cookies",
        tone: "professional",
        length: "long",
        includeCode: true,
      },
      {
        topic: "RGPD et analytics web : guide de conformité",
        keyword: "RGPD analytics",
        tone: "professional", 
        length: "medium",
        includeCode: false,
      },
      {
        topic: "Top 7 alternatives à Google Analytics",
        keyword: "alternative google analytics",
        tone: "friendly",
        length: "medium",
        includeCode: false,
      },
      {
        topic: "Analytics pour débutants : comprendre ses visiteurs",
        keyword: "analytics pour débutants",
        tone: "friendly",
        length: "medium",
        includeCode: true,
      },
      {
        topic: "Migrer de Google Analytics vers une solution privacy-first",
        keyword: "migrer google analytics",
        tone: "professional",
        length: "long",
        includeCode: true,
      },
    ];
  }
}
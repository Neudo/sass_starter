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
    
    console.log("Generating article with Claude API...");
    console.log("API Key present:", !!this.anthropicApiKey);
    console.log("API Key length:", this.anthropicApiKey?.length);
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 8000, // Increase for complete articles
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Claude API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`API request failed: ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      console.log("Claude response structure:", JSON.stringify(data, null, 2));
      
      const content = data.content[0].text;
      console.log("Claude response content:", content.substring(0, 500));

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

    // Load blog writing rules from the agent file
    const blogRulesReference = `
Reference the blog writing guidelines in .claude/agents/blog-post-rules.md for comprehensive rules.
Key principles:
- Conversational tone like Plausible Analytics
- Educational before commercial
- Never "Hector Analytics" in titles
- Maximum 2-3 subtle product mentions
- Natural, human-like writing style
`;

    return `You are a web writing expert specializing in analytics and privacy, with a conversational and educational tone like Plausible Analytics.

${blogRulesReference}

CRITICAL WRITING RULES (must be absolutely followed):
- CONVERSATIONAL tone: write as if explaining to a friend
- EDUCATIONAL approach: explain concepts before proposing solutions  
- AVOID aggressive marketing and superlatives ("revolutionary", "incredible")
- NEVER "Hector Analytics" in the title (use "a solution", "this tool")
- Maximum 2-3 natural mentions of Hector Analytics in the article
- Prefer "You might have wondered...", "An interesting thing..."

PARAMETERS:
- Topic: ${options.topic}
- Main keyword: ${options.keyword}
- Tone: ${options.tone || "professional"} (but always conversational)
- Length: ${lengthWords[options.length || "medium"]} words
${options.includeCode ? "- Include practical code examples" : ""}

CONTEXT (Hector Analytics - subtle mentions only):
- Privacy-respecting analytics solution
- Works without cookies 
- Automatic GDPR compliance
- Lightweight and simple to install script

NATURAL STRUCTURE:
1. Conversational title (WITHOUT "Hector Analytics") focused on the problem/question
2. Introduction: natural observation or question → context → what we'll learn
3. 4-5 sections with natural subtitles (not marketing)
4. Conclusion: summary + opening + subtle CTA if justified

WRITING STYLE:
- Opening phrases: "A few years ago...", "Something few people realize..."
- Transitions: "Which brings us to...", "Now, let's talk about..."
- Product mentions: "This is exactly what we wanted to solve", "Our approach..."
- Avoid systematic bullet points
- Explain the "why" before the "how"
- Mention nuances and trade-offs

SEO OPTIMIZATION (discreet):
- Keyword in title and intro naturally
- H1, H2, H3 structure with conversational titles
- Engaging meta description (155 characters max)
- Semantic keywords integrated naturally

RESPONSE FORMAT:
Return ONLY a valid JSON object (no text before/after).
IMPORTANT: For the "content" field, write the HTML as a proper JSON string without line breaks inside the HTML content.

{
  "title": "Conversational title WITHOUT Hector Analytics",
  "slug": "seo-friendly-url-slug", 
  "content": "Complete HTML content as a single JSON string - use proper HTML tags like <h1>, <h2>, <p>, <strong>, etc. Make sure the content is complete and not truncated",
  "excerpt": "Engaging summary of 150-160 characters",
  "metaDescription": "Natural meta description of 150-155 characters",
  "keywords": ["main keyword", "secondary keyword 1", "secondary keyword 2"],
  "readingTime": 8,
  "seoScore": 85
}

CRITICAL: Ensure the "content" field contains the COMPLETE article (${lengthWords[options.length || "medium"]} words) and is properly formatted as a JSON string.`;
  }

  private parseResponse(content: string): BlogPost {
    try {
      console.log("Parsing response, looking for JSON...");
      
      // Clean up the content first
      const cleanContent = content.trim();
      
      // First, try to parse the entire content as JSON
      try {
        const parsed = JSON.parse(cleanContent);
        console.log("Direct JSON parse successful");
        return this.formatBlogPost(parsed);
      } catch {
        console.log("Not direct JSON, trying other patterns...");
      }
      
      // Try to extract JSON from code blocks
      const codeBlockMatch = cleanContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        try {
          const parsed = JSON.parse(codeBlockMatch[1].trim());
          console.log("Found JSON in code block");
          return this.formatBlogPost(parsed);
        } catch {
          console.log("Failed to parse code block content");
        }
      }
      
      // Try to find a JSON object in the content
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const possibleJson = cleanContent.substring(jsonStart, jsonEnd + 1);
        try {
          const parsed = JSON.parse(possibleJson);
          console.log("Found JSON object in content");
          return this.formatBlogPost(parsed);
        } catch (e) {
          console.error("Failed to parse extracted JSON:", e);
        }
      }
      
      console.error("No valid JSON found in response");
      console.error("Response was:", cleanContent.substring(0, 500));
      throw new Error("No valid JSON found in response");
    } catch (error) {
      console.error("Error parsing response:", error);
      throw new Error("Failed to parse AI response");
    }
  }

  private formatBlogPost(parsed: Record<string, unknown>): BlogPost {
    const content = parsed.content as string;
    const title = parsed.title as string;
    
    // Validate content length
    if (!content || content.length < 500) {
      console.warn("Generated content seems too short:", content?.length || 0, "characters");
      console.warn("Content preview:", content?.substring(0, 200) || "No content");
    }
    
    // Validate that content contains proper HTML structure
    if (content && !content.includes('<') && !content.includes('>')) {
      console.warn("Generated content doesn't appear to contain HTML tags");
    }
    
    return {
      title: title || "Generated Article",
      content: content || "<p>Article content not generated properly</p>",
      excerpt: (parsed.excerpt as string) || "",
      keywords: (parsed.keywords as string[]) || [],
      metaDescription: (parsed.metaDescription as string) || (parsed.meta_description as string) || "",
      slug: (parsed.slug as string) || this.generateSlug(title || "generated-article"),
      readingTime: (parsed.readingTime as number) || (parsed.reading_time as number) || this.calculateReadingTime(content || ""),
      seoScore: (parsed.seoScore as number) || (parsed.seo_score as number) || 75,
    };
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private parseRewriteResponse(content: string): Record<string, unknown> {
    try {
      console.log("Parsing rewrite response, looking for JSON...");
      console.log("Raw content first 500 chars:", content.substring(0, 500));
      
      // Clean up the content first
      let cleanContent = content.trim();
      
      // Remove any potential markdown formatting
      cleanContent = cleanContent.replace(/^```json\s*/g, '').replace(/```\s*$/g, '');
      cleanContent = cleanContent.replace(/^```\s*/g, '').replace(/```\s*$/g, '');
      
      // First, try to parse the entire content as JSON
      try {
        const parsed = JSON.parse(cleanContent);
        console.log("Direct JSON parse successful for rewrite");
        return parsed;
      } catch (directError) {
        console.log("Direct JSON parse failed:", directError.message);
      }
      
      // Try to extract JSON from code blocks (more patterns)
      const codeBlockPatterns = [
        /```(?:json)?\s*([\s\S]*?)```/,
        /```\s*([\s\S]*?)```/,
        /`([\s\S]*?)`/
      ];
      
      for (const pattern of codeBlockPatterns) {
        const match = cleanContent.match(pattern);
        if (match) {
          try {
            const parsed = JSON.parse(match[1].trim());
            console.log("Found JSON in code block for rewrite");
            return parsed;
          } catch (blockError) {
            console.log("Failed to parse code block content:", blockError.message);
          }
        }
      }
      
      // Try to find a JSON object in the content (more robust)
      let jsonStart = -1;
      let jsonEnd = -1;
      let braceCount = 0;
      
      for (let i = 0; i < cleanContent.length; i++) {
        if (cleanContent[i] === '{') {
          if (jsonStart === -1) jsonStart = i;
          braceCount++;
        } else if (cleanContent[i] === '}') {
          braceCount--;
          if (braceCount === 0 && jsonStart !== -1) {
            jsonEnd = i;
            break;
          }
        }
      }
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const possibleJson = cleanContent.substring(jsonStart, jsonEnd + 1);
        try {
          const parsed = JSON.parse(possibleJson);
          console.log("Found JSON object in rewrite content using brace counting");
          return parsed;
        } catch (extractError) {
          console.error("Failed to parse extracted JSON for rewrite:", extractError.message);
        }
      }
      
      // Last resort: try to extract key-value pairs manually if it looks like JSON-ish content
      if (cleanContent.includes('"title"') && cleanContent.includes('"content"')) {
        console.log("Attempting manual JSON reconstruction...");
        // This is a fallback - we'll try to reconstruct based on common patterns
        // Use more flexible patterns to handle escaped content
        const titleMatch = cleanContent.match(/"title"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/);
        const excerptMatch = cleanContent.match(/"excerpt"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/);
        const metaMatch = cleanContent.match(/"metaDescription"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/);
        
        // For content, we need to be more careful as it can contain HTML with quotes
        let contentMatch = null;
        const contentStartMatch = cleanContent.match(/"content"\s*:\s*"/);
        if (contentStartMatch) {
          let startIndex = contentStartMatch.index + contentStartMatch[0].length;
          let endIndex = startIndex;
          let escaping = false;
          let depth = 0;
          
          // Find the end of the content string, accounting for escaped quotes
          for (let i = startIndex; i < cleanContent.length; i++) {
            const char = cleanContent[i];
            if (escaping) {
              escaping = false;
              continue;
            }
            if (char === '\\') {
              escaping = true;
              continue;
            }
            if (char === '"' && depth === 0) {
              endIndex = i;
              break;
            }
          }
          
          if (endIndex > startIndex) {
            const contentText = cleanContent.substring(startIndex, endIndex);
            // Unescape the content
            const unescapedContent = contentText.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            contentMatch = [null, unescapedContent];
          }
        }
        
        const keywordsMatch = cleanContent.match(/"keywords"\s*:\s*\[(.*?)\]/);
        
        if (titleMatch && contentMatch) {
          const reconstructed = {
            title: titleMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\'),
            content: contentMatch[1],
            keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim().replace(/"/g, '')) : [],
            excerpt: excerptMatch ? excerptMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\') : "",
            metaDescription: metaMatch ? metaMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\') : ""
          };
          console.log("Successfully reconstructed JSON manually with proper unescaping");
          console.log("Content length:", reconstructed.content.length);
          return reconstructed;
        }
      }
      
      console.error("No valid JSON found in rewrite response");
      console.error("Rewrite response was:", cleanContent.substring(0, 1000));
      throw new Error("No valid JSON found in rewrite response");
    } catch (error) {
      console.error("Error parsing rewrite response:", error);
      throw new Error("Failed to parse AI rewrite response");
    }
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

  async rewriteArticle(options: {
    originalTitle: string;
    originalContent: string;
    targetService: string;
    style?: "professional" | "friendly" | "technical";
  }): Promise<BlogPost> {
    const { originalTitle, originalContent, targetService, style = "professional" } = options;

    const prompt = `You are a web writing expert with a conversational and educational style (like Plausible Analytics). You will rewrite this article for "${targetService}" following strict natural tone rules.

ORIGINAL ARTICLE:
Title: ${originalTitle}
Content: ${originalContent.substring(0, 3000)}...

WRITING RULES (CRITICAL):
- CONVERSATIONAL tone: write as if explaining to a friend
- EDUCATIONAL approach: explain concepts first, then solutions
- ABSOLUTELY AVOID aggressive marketing and superlatives
- NEVER "${targetService}" in the title (use "a solution", "this type of tool")
- Maximum 2-3 natural mentions of ${targetService} in the article
- Prefer: "You might have wondered...", "An interesting thing..."

REWRITING INSTRUCTIONS:
1. Rewrite COMPLETELY with different vocabulary and structure
2. Adopt a conversational and pedagogical tone
3. Keep the main message but explain rather than sell
4. Add/remove sections if it improves understanding
5. Replace product references with subtle mentions
6. Avoid systematic bullet points
7. Explain the "why" before the "how"
8. Generate a natural title focused on the question/problem (WITHOUT ${targetService})
9. Content between 2000-3000 words with natural tone
10. HTML structure with conversational titles

NATURAL STYLE:
- Openings: "A few years ago...", "Many wonder..."
- Transitions: "Which brings us to...", "From a practical standpoint..."
- Product mentions: "This is exactly the challenge we're trying to solve"
- Nuances and trade-offs mentioned
- Balanced approach, no overselling

IMPORTANT:
- 100% original, no copied phrases
- Educational before commercial
- Natural before SEO optimized
- Must be publishable on any tech blog

MANDATORY JSON FORMAT - CRITICAL:
You MUST return ONLY a valid JSON object with no text before or after.
Use double quotes for ALL strings, including HTML content.
NEVER use backticks, template literals, or line breaks within JSON strings.

Expected JSON structure:
{
  "title": "Conversational title WITHOUT ${targetService}",
  "content": "Complete HTML content (2000-3000 words) as a single JSON string - use proper HTML tags and ensure the full article is included without truncation",
  "keywords": ["keyword 1", "keyword 2", "keyword 3"],
  "excerpt": "Natural summary of 150 characters max",
  "metaDescription": "Conversational meta description 150-155 characters"
}

CRITICAL: 
- Return ONLY the JSON object, no explanatory text, no markdown formatting, no code blocks
- Ensure the "content" field contains the COMPLETE rewritten article (not truncated)
- Format HTML content as a proper JSON string with escaped quotes if needed`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022", // Use more powerful model
          max_tokens: 8000, // Increase tokens for complete articles
          temperature: 0.8, // Higher temperature for more creative rewriting
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Claude API error:", error);
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content[0].text;
      console.log("Claude rewrite response full content:", content);
      console.log("Claude rewrite response length:", content.length);
      
      // Parse the JSON response using the same robust method
      const parsedContent = this.parseRewriteResponse(content);

      const blogPost: BlogPost = {
        title: parsedContent.title,
        content: parsedContent.content,
        excerpt: parsedContent.excerpt,
        keywords: parsedContent.keywords,
        metaDescription: parsedContent.metaDescription,
        slug: this.generateSlug(parsedContent.title as string),
        readingTime: Math.ceil((parsedContent.content as string).split(" ").length / 200),
        seoScore: this.calculateSeoScore(parsedContent as Record<string, unknown>),
      };

      return blogPost;
    } catch (error) {
      console.error("Error rewriting article:", error);
      throw error;
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 60);
  }

  private calculateSeoScore(parsedContent: Record<string, unknown>): number {
    let score = 60; // Base score
    
    const title = parsedContent.title as string;
    const content = parsedContent.content as string;
    const keywords = parsedContent.keywords as string[] || [];
    const metaDescription = parsedContent.metaDescription as string;
    
    // Title optimization (10 points)
    if (title && title.length >= 30 && title.length <= 60) {
      score += 10;
    } else if (title && title.length > 0) {
      score += 5;
    }
    
    // Content length (10 points)
    if (content && content.length >= 1500) {
      score += 10;
    } else if (content && content.length >= 800) {
      score += 5;
    }
    
    // Keywords (10 points)
    if (keywords && keywords.length >= 3) {
      score += 10;
    } else if (keywords && keywords.length > 0) {
      score += 5;
    }
    
    // Meta description (10 points)
    if (metaDescription && metaDescription.length >= 140 && metaDescription.length <= 155) {
      score += 10;
    } else if (metaDescription && metaDescription.length > 0) {
      score += 5;
    }
    
    return Math.min(score, 100); // Cap at 100
  }

  // Predefined topics for automated generation (conversational approach)
  static getTopicIdeas(): GenerateArticleOptions[] {
    return [
      {
        topic: "Why do tracking cookies actually pose a problem?",
        keyword: "tracking cookies problem",
        tone: "friendly",
        length: "long",
        includeCode: true,
      },
      {
        topic: "GDPR and web analytics: what has really changed?",
        keyword: "GDPR web analytics",
        tone: "professional", 
        length: "medium",
        includeCode: false,
      },
      {
        topic: "How has web analytics evolved in recent years?",
        keyword: "web analytics evolution",
        tone: "friendly",
        length: "medium",
        includeCode: false,
      },
      {
        topic: "Understanding your visitors without spying on them: is it possible?",
        keyword: "privacy-respecting analytics",
        tone: "friendly",
        length: "medium",
        includeCode: true,
      },
      {
        topic: "What happens when you stop using Google Analytics?",
        keyword: "stop using google analytics",
        tone: "professional",
        length: "long",
        includeCode: true,
      },
      {
        topic: "Analytics and web performance: the real impact of tracking scripts",
        keyword: "analytics performance impact",
        tone: "technical",
        length: "medium",
        includeCode: true,
      },
    ];
  }
}
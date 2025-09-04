import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { unified } from "unified";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import rehypeParse from "rehype-parse";

/**
 * Convert Markdown to HTML
 */
export function markdownToHtml(markdown: string): string {
  try {
    const result = remark()
      .use(remarkGfm) // GitHub Flavored Markdown
      .use(remarkHtml, { sanitize: false }) // Allow raw HTML
      .processSync(markdown);
    
    return String(result);
  } catch (error) {
    console.error("Error converting markdown to HTML:", error);
    return markdown;
  }
}

/**
 * Convert HTML to Markdown (best effort)
 * Note: This is a simplified conversion and may not be perfect
 */
export function htmlToMarkdown(html: string): string {
  try {
    const result = unified()
      .use(rehypeParse) // Parse HTML
      .use(rehypeRemark) // Convert to Markdown AST
      .use(remarkStringify) // Stringify to Markdown
      .processSync(html);
    
    return String(result);
  } catch (error) {
    console.error("Error converting HTML to markdown:", error);
    
    // Fallback: basic HTML to Markdown conversion
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1")
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1")
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1")
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1")
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1")
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
      .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
      .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, "![$2]($1)")
      .replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, "![$1]($2)")
      .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, "![]($1)")
      .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
      .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, "```\n$1\n```")
      .replace(/<pre[^>]*>(.*?)<\/pre>/gi, "```\n$1\n```")
      .replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1");
      })
      .replace(/<ol[^>]*>(.*?)<\/ol>/gi, (match, content) => {
        let counter = 1;
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1`);
      })
      .replace(/<br\s*\/?>/gi, "  \n")
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<div[^>]*>(.*?)<\/div>/gi, "$1\n")
      .replace(/<[^>]*>/g, "") // Remove remaining HTML tags
      .replace(/\n\s*\n\s*\n/g, "\n\n") // Clean up excessive newlines
      .trim();
  }
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  try {
    const result = unified()
      .use(rehypeParse)
      .use(rehypeRaw)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .processSync(html);
    
    return String(result);
  } catch (error) {
    console.error("Error sanitizing HTML:", error);
    return html;
  }
}

/**
 * Calculate reading time from text content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  // Remove HTML/Markdown formatting and count words
  const cleanText = content
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[#*`_\[\]]/g, "") // Remove Markdown formatting
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
  
  const wordCount = cleanText.split(" ").filter(word => word.length > 0).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove duplicate hyphens
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Extract plain text excerpt from Markdown/HTML
 */
export function extractExcerpt(content: string, maxLength: number = 160): string {
  // Remove HTML tags and Markdown formatting
  const plainText = content
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[#*`_\[\]]/g, "") // Remove Markdown formatting
    .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
    .replace(/\[.*?\]\(.*?\)/g, "$1") // Convert links to plain text
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find the last complete word within the limit
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + "..."
    : truncated + "...";
}
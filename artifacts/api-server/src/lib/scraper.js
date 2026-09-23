/**
 * URL article content scraper in pure JavaScript.
 * Fetches a URL and extracts the plain text content for analysis.
 */

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
    .replace(/<\/?(p|br|div|h[1-6]|li|blockquote)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/\s{3,}/g, "\n\n")
    .trim();
}

function extractMeta(html, property) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
  ];
  for (const pat of patterns) {
    const m = html.match(pat);
    if (m?.[1]) return m[1].trim();
  }
  return "";
}

function extractTitle(html) {
  const og = extractMeta(html, "og:title");
  if (og) return og;
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch?.[1]?.trim() || "";
}

function extractAuthor(html) {
  return (
    extractMeta(html, "author") ||
    extractMeta(html, "article:author") ||
    html.match(/["']author["'][^"']*["']([^"']{3,80})["']/i)?.[1] ||
    ""
  );
}

function extractPublishDate(html) {
  return (
    extractMeta(html, "article:published_time") ||
    extractMeta(html, "date") ||
    extractMeta(html, "pubdate") ||
    html.match(/datetime=["']([^"']{10,25})["']/i)?.[1] ||
    ""
  );
}

export async function scrapeUrl(url) {
  const domain = extractDomain(url);
  const fallback = {
    url,
    domain,
    title: "",
    text: "",
    author: "",
    publishDate: "",
    description: "",
    wordCount: 0,
    scrapedOk: false,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SatyaCheck/1.0; +https://satyacheck.ai)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) return fallback;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return fallback;

    const html = await response.text();

    const title = extractTitle(html);
    const description = extractMeta(html, "og:description") || extractMeta(html, "description");
    const author = extractAuthor(html);
    const publishDate = extractPublishDate(html);
    const rawText = stripHtml(html);

    const lines = rawText.split("\n").filter((l) => l.trim().length > 40);
    const text = lines.slice(0, 80).join("\n").substring(0, 6000);
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return {
      url,
      domain,
      title,
      text,
      author,
      publishDate,
      description,
      wordCount,
      scrapedOk: text.length > 100,
    };
  } catch {
    return fallback;
  }
}

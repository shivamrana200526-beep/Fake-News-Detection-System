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
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html, property) {
  const match =
    html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${property}["']`, "i"));
  return match ? match[1].trim() : "";
}

function extractTitle(html) {
  const ogTitle = extractMeta(html, "og:title");
  if (ogTitle) return ogTitle;
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : "";
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
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);
    if (!res.ok) return fallback;

    const html = await res.text();
    const title = extractTitle(html);
    const description = extractMeta(html, "description") || extractMeta(html, "og:description");
    const author = extractMeta(html, "author");
    const text = stripHtml(html).substring(0, 4000);
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return {
      url,
      domain,
      title,
      text,
      author,
      publishDate: "",
      description,
      wordCount,
      scrapedOk: text.length > 50,
    };
  } catch {
    return fallback;
  }
}

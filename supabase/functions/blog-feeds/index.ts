// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://nepalvisuals.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "sitemap"; // 'sitemap' or 'rss'

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Posts
    const { data: posts, error: postsError } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, published_at, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (postsError) throw postsError;

    let xml = "";
    
    if (type === "rss") {
      xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Nepal Visuals Blog</title>
  <link>${SITE_URL}/blog</link>
  <description>Trekking and traveling guides for Nepal.</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${url.toString()}" rel="self" type="application/rss+xml" />
  ${posts.map(post => `
  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>${SITE_URL}/blog/${post.slug}</link>
    <guid>${SITE_URL}/blog/${post.slug}</guid>
    <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
    <description><![CDATA[${post.excerpt || ''}]]></description>
  </item>`).join('')}
</channel>
</rss>`;
    } else {
      // Sitemap
      // Fetch Categories and Tags for Sitemap
      const [categoriesResponse, tagsResponse, distinctAuthorsResponse] = await Promise.all([
        supabase.from("blog_categories").select("slug"),
        supabase.from("blog_tags").select("slug"),
        supabase.from("blog_posts").select("author_id").eq("status", "published")
      ]);

      const categories = categoriesResponse.data || [];
      const tags = tagsResponse.data || [];
      
      // Get unique author IDs from published posts
      const authorIds = [...new Set((distinctAuthorsResponse.data || []).map(p => p.author_id).filter(id => id))];

      xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${posts.map(post => `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at || post.published_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${categories.map(cat => `
  <url>
    <loc>${SITE_URL}/blog/category/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
  ${tags.map(tag => `
  <url>
    <loc>${SITE_URL}/blog/tag/${tag.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join('')}
  ${authorIds.map(id => `
  <url>
    <loc>${SITE_URL}/blog/author/${id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join('')}
</urlset>`;
    }

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600"
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

import type { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aether.studio";
  const apiUrl = process.env.INTERNAL_API_URL || "http://127.0.0.1:8000/api";

  try {
    const res = await fetch(`${apiUrl}/blog/posts/${slug}`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const post = await res.json();
      if (post) {
        const title = post.meta_title || post.title;
        const description = post.meta_description || (post.excerpt || post.content ? (post.excerpt || post.content).replace(/<[^>]*>?/gm, "") : `Read ${post.title} on the official newsroom.`).trim().slice(0, 160);
        const imageUrl = post.featured_image || `${siteUrl}/favicon.ico`;
        const imageAlt = post.featured_image_alt || title;

        return {
          title,
          description,
          openGraph: {
            type: "article",
            url: `${siteUrl}/blog/${slug}`,
            title,
            description,
            images: [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: imageAlt,
              },
            ],
          },
          twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [imageUrl],
          },
        };
      }
    }
  } catch (err) {
    console.warn("Blog post metadata fetch notice:", err);
  }

  return {
    title: "Article Details",
    description: "Read technical guides, engineering notes, and acoustic reviews.",
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}

/**
 * Creates Blog Post + Author content types and 5 sample blog posts in Contentful (master env).
 * Requires: CONTENTFUL_MANAGEMENT_ACCESS_TOKEN, CONTENTFUL_SPACE_ID in env (e.g. .env or .env.local).
 */
import * as contentful from "contentful-management";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID ?? "";
const ENV_ID = "master";
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN ?? "";

if (!SPACE_ID || !CMA_TOKEN) {
  console.error(
    "Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_ACCESS_TOKEN. Set in .env or .env.local."
  );
  process.exit(1);
}

const client = contentful.createClient({ accessToken: CMA_TOKEN });

function richTextDocument(paragraphs: string[]) {
  return {
    nodeType: "document",
    data: {},
    content: paragraphs.map((text) => ({
      nodeType: "paragraph",
      data: {},
      content: [{ nodeType: "text", value: text, marks: [], data: {} }],
    })),
  };
}

async function main() {
  const space = await client.getSpace(SPACE_ID);
  const env = await space.getEnvironment(ENV_ID);

  // 1) Author content type
  let authorCt;
  try {
    authorCt = await env.getContentType("author");
    console.log("Author content type already exists.");
  } catch {
    authorCt = await env.createContentTypeWithId("author", {
      name: "Author",
      displayField: "internalName",
      description: "Blog author",
      fields: [
        { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
        { id: "name", name: "Name", type: "Symbol", required: true },
        { id: "bio", name: "Bio", type: "Text" },
      ],
    });
    await authorCt.publish();
    console.log("Created and published Author content type.");
  }

  // 2) Blog Post content type
  let blogPostCt;
  try {
    blogPostCt = await env.getContentType("blogPost");
    console.log("Blog Post content type already exists.");
  } catch {
    blogPostCt = await env.createContentTypeWithId("blogPost", {
      name: "Blog Post",
      displayField: "internalName",
      description: "Blog post with author",
      fields: [
        { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
        { id: "title", name: "Title", type: "Symbol", required: true },
        { id: "slug", name: "Slug", type: "Symbol", required: true },
        { id: "excerpt", name: "Excerpt", type: "Text" },
        { id: "heroImage", name: "Hero Image", type: "Link", linkType: "Asset" },
        {
          id: "body",
          name: "Body",
          type: "RichText",
          validations: [
            {
              enabledNodeTypes: [
                "heading-1", "heading-2", "heading-3",
                "paragraph", "unordered-list", "ordered-list", "list-item",
                "blockquote", "hyperlink", "entry-hyperlink", "asset-hyperlink",
                "embedded-entry-block", "embedded-asset-block",
              ],
            },
          ],
        },
        {
          id: "author",
          name: "Author",
          type: "Link",
          linkType: "Entry",
          validations: [{ linkContentType: ["author"] }],
        },
        { id: "publishDate", name: "Publish Date", type: "Date" },
        {
          id: "tags",
          name: "Tags",
          type: "Array",
          items: { type: "Symbol" },
        },
      ],
    });
    await blogPostCt.publish();
    console.log("Created and published Blog Post content type.");
  }

  // 3) Create 3 authors
  const authorPayloads = [
    { internalName: "Sarah Chen", name: "Sarah Chen", bio: "Tech writer and developer advocate." },
    { internalName: "Marcus Johnson", name: "Marcus Johnson", bio: "Product manager and UX enthusiast." },
    { internalName: "Elena Rodriguez", name: "Elena Rodriguez", bio: "Full-stack engineer and open source contributor." },
  ];
  const authorEntryIds: string[] = [];
  for (const payload of authorPayloads) {
    const existing = await env.getEntries({ content_type: "author", "fields.name": payload.name });
    if (existing.items.length > 0) {
      authorEntryIds.push(existing.items[0].sys.id);
      continue;
    }
    const entry = await env.createEntry("author", {
      fields: {
        internalName: { "en-US": payload.internalName },
        name: { "en-US": payload.name },
        bio: { "en-US": payload.bio },
      },
    });
    await entry.publish();
    authorEntryIds.push(entry.sys.id);
  }
  console.log("Authors ready:", authorEntryIds.length);

  // 4) Create 5 blog posts
  const posts = [
    {
      internalName: "Getting Started with Next.js",
      title: "Getting Started with Next.js",
      slug: "getting-started-with-nextjs",
      excerpt: "A quick guide to building modern React apps with Next.js.",
      authorIndex: 0,
      publishDate: "2025-01-15",
      tags: ["tutorial", "javascript", "react"],
      body: ["Next.js is a powerful React framework.", "This post walks you through setup and first steps."],
    },
    {
      internalName: "TypeScript Best Practices",
      title: "TypeScript Best Practices in 2025",
      slug: "typescript-best-practices-2025",
      excerpt: "Level up your TypeScript with these patterns and tips.",
      authorIndex: 1,
      publishDate: "2025-02-01",
      tags: ["typescript", "javascript"],
      body: ["TypeScript helps scale large codebases.", "We cover strict mode, inference, and utility types."],
    },
    {
      internalName: "Contentful and Next.js",
      title: "Contentful and Next.js: Headless CMS Setup",
      slug: "contentful-nextjs-headless-cms",
      excerpt: "Connect Contentful to your Next.js app for flexible content.",
      authorIndex: 2,
      publishDate: "2025-02-20",
      tags: ["contentful", "nextjs", "cms"],
      body: ["Headless CMS separates content from presentation.", "Here we integrate Contentful with Next.js App Router."],
    },
    {
      internalName: "React Server Components",
      title: "Understanding React Server Components",
      slug: "understanding-react-server-components",
      excerpt: "What RSC means for data fetching and performance.",
      authorIndex: 0,
      publishDate: "2025-03-01",
      tags: ["react", "nextjs", "performance"],
      body: ["Server Components run only on the server.", "They reduce bundle size and enable simpler data loading."],
    },
    {
      internalName: "Building a Blog",
      title: "Building a Blog with Next.js and Contentful",
      slug: "building-blog-nextjs-contentful",
      excerpt: "End-to-end guide to a content-driven blog.",
      authorIndex: 1,
      publishDate: "2025-03-10",
      tags: ["tutorial", "nextjs", "contentful", "blog"],
      body: ["We combine Next.js, Contentful, and a few conventions.", "You get a fast, editable blog in the master environment."],
    },
  ];

  for (const post of posts) {
    const existing = await env.getEntries({ content_type: "blogPost", "fields.slug": post.slug });
    if (existing.items.length > 0) {
      console.log("Blog post already exists:", post.slug);
      continue;
    }
    const authorId = authorEntryIds[post.authorIndex];
    const entry = await env.createEntry("blogPost", {
      fields: {
        internalName: { "en-US": post.internalName },
        title: { "en-US": post.title },
        slug: { "en-US": post.slug },
        excerpt: { "en-US": post.excerpt },
        body: { "en-US": richTextDocument(post.body) },
        author: {
          "en-US": {
            sys: { type: "Link", linkType: "Entry", id: authorId },
          },
        },
        publishDate: { "en-US": post.publishDate },
        tags: { "en-US": post.tags },
      },
    });
    await entry.publish();
    console.log("Created and published:", post.slug);
  }

  console.log("Done. Blog content type and 5 sample posts are in the master environment.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

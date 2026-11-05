import { defineCollection, z } from 'astro:content';

// 攻略内容集合：每篇攻略是一个 Markdown 文件，frontmatter 走此 schema
// 支持与游戏库关联（gameSlug），详情页会自动互链对应游戏，利好 SEO 站内链路。
const guides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    gameSlug: z.string().optional(), // 关联 games.json 中的 slug
    category: z.string().default('攻略'),
    cover: z.string().optional(), // public 下图片，缺省用占位
    tags: z.array(z.string()).default([]),
    author: z.string().default('编辑部'),
    date: z.coerce.date(),
  }),
});

export const collections = { guides };

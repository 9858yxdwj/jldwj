import type { APIRoute } from 'astro';

// 动态生成 robots.txt：base 感知 + 指向 sitemap（项目页也能正确索引）
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL;
  // site 来自 astro.config 的 site 字段；本地无仓库变量时回退为配置里的占位值
  const root = (site ?? new URL(base, 'https://example.github.io')).href.replace(/\/$/, '');
  const sitemapUrl = `${root}/sitemap-index.xml`;

  const body = `User-agent: *
Allow: /

# 百度/Google/Bing 通用 sitemap 指引
Sitemap: ${sitemapUrl}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

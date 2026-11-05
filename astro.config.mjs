// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ── 部署说明（GitHub Pages）────────────────────────────
// 1) site 填你的线上地址（用于 sitemap / canonical / OG）。
//    例：用户名 user、仓库 game-site → 'https://user.github.io/game-site/'
// 2) 若用「项目页」（非 user/org 页），需取消下面 base 注释并填仓库名，
//    否则资源路径会 404：base: '/game-site/'
// 3) 自定义域名需：①ICP备案完成 → ②DNS解析就绪 → ③再挂域名并强制HTTPS
//    （详见 AI-PROMPTS.md 第六、红线部分；备案/DNS 未好前绝不挂载，避免全站宕机）
// ── 自动适配 GitHub Pages ───────────────────
// CI 中环境变量 GITHUB_REPOSITORY=owner/repo 时，自动推导 base 与 site；
// 本地开发（无该变量）保持根路径，无需手动改配置。
// 因此「用户/组织页」与「项目页」都能一键部署，无需来回改 base。
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const owner = process.env.GITHUB_REPOSITORY?.split('/')[0];
const base = repo ? `/${repo}/` : '/';
const site = repo ? `https://${owner}.github.io/${repo}/` : 'https://example.github.io';

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [sitemap()],
  // 开发服务器监听所有网卡（含 IPv4 127.0.0.1），方便本地预览面板访问
  server: { host: true, port: 4321 },
  // 图片：public/images/ 下的 webp 由 scripts/build-images.mjs 统一生成（压缩 + 尺寸归一）。
  // 所有 public 资源都通过 src/utils/asset.ts 的 asset() 转成 base 感知路径，
  // 避免 GitHub Pages 项目页（/<repo>/）下图片 404。
});

// 部署后向百度搜索资源平台主动推送 sitemap 中的 URL（提升收录）
// 用法（CI 中通过 secrets 注入，无需本地配置）：
//   BAIDU_SITE  在百度资源平台认证的站点（如 https://xxx.github.io 或你的域名）
//   BAIDU_TOKEN 资源平台「普通收录 → 主动推送」里的 token
//   SITE_URL    站点根地址（CI 用部署输出，本地可省略）
// 未设置 BAIDU_TOKEN 时自动跳过，保证工作流不会因未配置而失败。
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const site = process.env.BAIDU_SITE;
const token = process.env.BAIDU_TOKEN;

if (!site || !token) {
  console.log('[baidu-push] BAIDU_SITE / BAIDU_TOKEN 未设置，跳过百度推送。');
  process.exit(0);
}

// 1) 从 dist 下的 sitemap-*.xml 提取所有 <loc> URL
const dir = 'dist';
let urls = [];
try {
  const files = readdirSync(dir).filter((f) => /^sitemap-\d+\.xml$/.test(f));
  for (const f of files) {
    const xml = readFileSync(join(dir, f), 'utf8');
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
    urls.push(...locs);
  }
} catch (e) {
  console.error('[baidu-push] 读取 sitemap 失败：', e.message);
  process.exit(0);
}
urls = [...new Set(urls)].filter(Boolean);
if (!urls.length) {
  console.log('[baidu-push] 未在 dist 中找到可推送的 URL，跳过。');
  process.exit(0);
}

const enc = encodeURIComponent;
const pushEndpoint = `http://data.zz.baidu.com/urls?site=${enc(site)}&token=${enc(token)}`;
const smEndpoint = `http://data.zz.baidu.com/sitemap?site=${enc(site)}&token=${enc(token)}`;
const siteRoot = (process.env.SITE_URL || site).replace(/\/$/, '');

async function main() {
  // 2) 主动推送（实时收录）：逐条 POST URL
  try {
    const res = await fetch(pushEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: urls.join('\n'),
    });
    const text = await res.text();
    console.log(`[baidu-push] 主动推送 ${urls.length} 条 → HTTP ${res.status}`);
    console.log(text);
  } catch (e) {
    console.error('[baidu-push] 主动推送请求失败：', e.message);
  }

  // 3) sitemap 提交（供百度定期抓取）
  try {
    const smUrl = `${siteRoot}/sitemap-index.xml`;
    const res = await fetch(smEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: `url=${enc(smUrl)}`,
    });
    const text = await res.text();
    console.log(`[baidu-push] sitemap 提交 ${smUrl} → HTTP ${res.status}`);
    console.log(text);
  } catch (e) {
    console.error('[baidu-push] sitemap 提交请求失败：', e.message);
  }
}

main();

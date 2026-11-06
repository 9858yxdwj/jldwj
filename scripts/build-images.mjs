/**
 * 游戏图片构建脚本
 * ------------------------------------------------------------------
 * 从 .assets-src/（官方渠道抓取的原始素材）统一生成站点用的 webp 图片。
 * 若源素材缺失，会按下方 SOURCE_URLS 里的官方地址重新下载。
 *
 * 图片来源（均为游戏官方/官方合作平台公开宣传素材）：
 *   - 老炮怀旧手游平台（游昕网络）官网 http://www.paogf.com
 *   - 《小小屠龙》手游官网       https://xxtlxz.cn
 *   - 《桃园：将帅录》手游官网   https://lzgzb.com
 *
 * 说明：图片版权归各游戏运营方所有，本站仅作测评/介绍用途，
 *       已在页面底部标注来源。若需商用请先取得授权。
 *
 * 用法：node scripts/build-images.mjs
 */
import sharp from 'sharp';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = resolve(ROOT, '.assets-src');
const OUT = resolve(ROOT, 'public/images');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36';

const PAOGF = 'http://www.paogf.com';
const XXTL = 'https://xxtlxz.cn';
const TAOYUAN = 'https://lzgzb.com';

/** 源文件名 → 官方原始 URL（用于溯源 / 缺失时重新抓取） */
const SOURCE_URLS = {
  'taoyuan-banner.webp': `${PAOGF}/static/upload/image/20260927/1790503942227342.webp`,
  'taoyuan-wide.webp': `${PAOGF}/static/upload/image/20260927/1790503981859289.webp`,
  'taoyuan-tall.webp': `${PAOGF}/static/upload/image/20260927/1790503987732930.webp`,
  'taoyuan-icon.webp': `${PAOGF}/static/upload/image/20260927/1790503777142027.webp`,
  'xxtl-banner.webp': `${PAOGF}/static/upload/image/20261019/1792376185290683.webp`,
  'xxtl-wide.webp': `${PAOGF}/static/upload/image/20261019/1792376193776503.webp`,
  'xxtl-tall.webp': `${PAOGF}/static/upload/image/20261019/1792376199317404.webp`,
  'xxtl-icon.webp': `${PAOGF}/static/upload/image/20261019/1792375091881517.webp`,
  'xxtl-shot-1744614197288209.jpg': `${XXTL}/static/upload/image/20250414/1744614197288209.jpg`,
  'xxtl-shot-1755656948878049.jpg': `${XXTL}/static/upload/image/20250820/1755656948878049.jpg`,
  'xxtl-shot-1783234398431233.webp': `${XXTL}/static/upload/other/20260705/1783234398431233.webp`,
  'xxtl-shot-1783234405811257.webp': `${XXTL}/static/upload/other/20260705/1783234405811257.webp`,
  'xxtl-shot-1783234438290902.webp': `${XXTL}/static/upload/other/20260705/1783234438290902.webp`,
  'ty-site-1.jpg': `${TAOYUAN}/uploadfile/202610/88883cb6b72dc5.jpg`,
  'ty-site-3.jpg': `${TAOYUAN}/uploadfile/202610/2a270682984e.jpg`,
  'ty-site-4.jpg': `${TAOYUAN}/uploadfile/202610/2f86d5477db6fdc.jpg`,
  'ty-site-5.jpg': `${TAOYUAN}/uploadfile/202610/b888640e744e.jpg`,
  'ty-site-6.jpg': `${TAOYUAN}/uploadfile/202610/6d31e03dd7d598d.jpg`,
  'g-tulong-wide.webp': `${PAOGF}/static/upload/image/20260908/1788853286854854.webp`,
  'g-tulong-icon.webp': `${PAOGF}/static/upload/image/20260908/1788853136188136.webp`,
  'g-dubu-wide.webp': `${PAOGF}/static/upload/image/20260908/1788851890955197.webp`,
  'g-dubu-icon.webp': `${PAOGF}/static/upload/image/20260927/1790504040204869.webp`,
  'g-jizhan-wide.webp': `${PAOGF}/static/upload/image/20260908/1788853417986131.webp`,
  'g-jizhan-icon.webp': `${PAOGF}/static/upload/image/20260908/1788853361367395.webp`,
  'g-xiuxian-wide.jpg': `${PAOGF}/static/upload/image/20260213/1770952941650868.jpg`,
  'g-xiuxian-icon.png': `${PAOGF}/static/upload/image/20260210/1770691813498735.png`,
  'g-jianyi-wide.jpg': `${PAOGF}/static/upload/image/20260712/1783840814317085.jpg`,
  'g-jianyi-icon.webp': `${PAOGF}/static/upload/image/20260712/1783840756756371.webp`,
  'g-moli-wide.jpg': `${PAOGF}/static/upload/image/20260213/1770951578858153.jpg`,
  'g-moli-icon.png': `${PAOGF}/static/upload/image/20260210/1770697104571939.png`,
};

mkdirSync(SRC, { recursive: true });
for (const d of ['covers', 'banners', 'icons', 'shots']) mkdirSync(resolve(OUT, d), { recursive: true });

/** 取得源图 Buffer：本地优先，缺失则从官方地址重新下载 */
async function source(name) {
  const p = resolve(SRC, name);
  if (existsSync(p)) return p;
  const url = SOURCE_URLS[name];
  if (!url) throw new Error(`缺少源图且无下载 URL: ${name}`);
  const referer = new URL(url).origin + '/';
  const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: referer } });
  if (!res.ok) throw new Error(`下载失败 ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(p, buf);
  console.log(`  ↓ 重新抓取 ${name}`);
  return p;
}

/** 统一输出为 webp */
async function emit(srcName, outPath, { width, height, fit = 'cover', quality = 82, bg = '#12141a' }) {
  const input = await source(srcName);
  await sharp(input)
    .resize(width, height, { fit, background: bg })
    .webp({ quality, effort: 5 })
    .toFile(resolve(OUT, outPath));
}

/** 输出清单：[源文件名, 输出相对路径, 规格]
 *  尺寸按「实际最大显示宽度 × 2 DPR」定，避免原先 2~4 倍过采样：
 *    COVER  详情页 banner ≈700px / 攻略封面 760px / 预览弹窗 480px → 800px
 *    ICON   主推卡 56px、海报内嵌 92px → 128px
 *    SHOT   详情页画廊两列，单张 ≈340px → 720px
 */
const COVER = { width: 800, height: 450, fit: 'cover', quality: 76 };
// Hero / 主推卡背景只作模糊铺底与暗遮罩，1440×810 q78 已足够；
// 相比原 1600×900 q86 可省约一半体积，直接缩短首屏 LCP。
const BANNER = { width: 1440, height: 810, fit: 'cover', quality: 78 };
const ICON = { width: 128, height: 128, fit: 'cover', quality: 80 };
const SHOT = { width: 720, height: 405, fit: 'contain', quality: 74, bg: '#0e1016' };

const jobs = [
  // ===== 两款主推：封面 / Hero 大图 / 图标 =====
  ['taoyuan-banner.webp', 'covers/taoyuan-jiangshuailu.webp', COVER],
  ['taoyuan-banner.webp', 'banners/taoyuan-jiangshuailu.webp', BANNER],
  ['taoyuan-icon.webp', 'icons/taoyuan-jiangshuailu.webp', ICON],
  ['xxtl-banner.webp', 'covers/xiaoxiao-tulong.webp', COVER],
  ['xxtl-banner.webp', 'banners/xiaoxiao-tulong.webp', BANNER],
  ['xxtl-icon.webp', 'icons/xiaoxiao-tulong.webp', ICON],

  // ===== 主推游戏截图画廊（官方游戏内截图 / 宣传图） =====
  ['ty-site-3.jpg', 'shots/taoyuan-1.webp', SHOT],
  ['ty-site-4.jpg', 'shots/taoyuan-2.webp', SHOT],
  ['ty-site-5.jpg', 'shots/taoyuan-3.webp', SHOT],
  ['ty-site-6.jpg', 'shots/taoyuan-4.webp', SHOT],
  ['xxtl-shot-1783234438290902.webp', 'shots/xxtl-1.webp', SHOT],
  ['xxtl-shot-1744614197288209.jpg', 'shots/xxtl-2.webp', SHOT],
  ['xxtl-shot-1755656948878049.jpg', 'shots/xxtl-3.webp', SHOT],
  ['xxtl-shot-1783234398431233.webp', 'shots/xxtl-4.webp', SHOT],
  ['xxtl-shot-1783234405811257.webp', 'shots/xxtl-5.webp', SHOT],

  // ===== 其余收录游戏：封面 + 图标 =====
  ['g-tulong-wide.webp', 'covers/tulong-shijie.webp', COVER],
  ['g-tulong-icon.webp', 'icons/tulong-shijie.webp', ICON],
  ['g-dubu-wide.webp', 'covers/dubu-wulin-2.webp', COVER],
  ['g-dubu-icon.webp', 'icons/dubu-wulin-2.webp', ICON],
  ['g-jizhan-wide.webp', 'covers/jizhan-gangtie.webp', COVER],
  ['g-jizhan-icon.webp', 'icons/jizhan-gangtie.webp', ICON],
  ['g-xiuxian-wide.jpg', 'covers/xiuxian-jiazu-2.webp', COVER],
  ['g-xiuxian-icon.png', 'icons/xiuxian-jiazu-2.webp', ICON],
  ['g-jianyi-wide.jpg', 'covers/jian-yu-yi.webp', COVER],
  ['g-jianyi-icon.webp', 'icons/jian-yu-yi.webp', ICON],
  ['g-moli-wide.jpg', 'covers/moli-baobei.webp', COVER],
  ['g-moli-icon.png', 'icons/moli-baobei.webp', ICON],
];

console.log(`生成 ${jobs.length} 张图片 ...`);
for (const [src, out, spec] of jobs) await emit(src, out, spec);
console.log(`✅ 完成，输出目录：${OUT}`);

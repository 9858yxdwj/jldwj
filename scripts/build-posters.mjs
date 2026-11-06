/**
 * 从官方宣传图生成 3:4 竖版「海报」素材，供海报墙卡片使用。
 *
 * 设计：模糊放大的同图作背景 + 中部清晰的官方横图 + 左上游戏图标 +
 *       底部由透明到纯黑的渐变（HTML 文字叠在这层上）。
 * 好处：不裁掉官方横图的主体信息，也不会混入与游戏不对应的第三方图片。
 *
 * 用法：node scripts/build-posters.mjs
 * 输出：public/images/posters/<slug>.webp（720×960）
 * 依赖：sharp、src/data/games.json、public/images/covers|icons
 */
import sharp from 'sharp';
import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'public', 'images', 'posters');
mkdirSync(OUT, { recursive: true });

const games = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'games.json'), 'utf8'));
const W = 720;
const H = 960;

// 底部暗渐变：0.55 起轻微压暗，0.78 起接近纯黑，保证 HTML 文字可读
const shadeSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0a0a0f" stop-opacity="0"/>
    <stop offset="0.5" stop-color="#0a0a0f" stop-opacity="0.05"/>
    <stop offset="0.68" stop-color="#0a0a0f" stop-opacity="0.55"/>
    <stop offset="0.85" stop-color="#0a0a0f" stop-opacity="0.9"/>
    <stop offset="1" stop-color="#0a0a0f" stop-opacity="0.99"/>
  </linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#s)"/>
</svg>`);
const shade = await sharp(shadeSvg).png().toBuffer();

// 顶部轻微压暗，增强竖版海报的层次感
const topShadeSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="200">
  <defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0a0a0f" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#0a0a0f" stop-opacity="0"/>
  </linearGradient></defs>
  <rect width="${W}" height="200" fill="url(#t)"/>
</svg>`);
const topShade = await sharp(topShadeSvg).png().toBuffer();

let ok = 0;
for (const g of games) {
  const coverPath = join(ROOT, 'public', g.cover.replace(/^\//, ''));
  if (!existsSync(coverPath)) {
    console.warn(`跳过 ${g.slug}：缺少封面 ${g.cover}`);
    continue;
  }

  const bg = await sharp(coverPath)
    .resize(W, H, { fit: 'cover' })
    .blur(30)
    .modulate({ brightness: 0.46, saturation: 0.85 })
    .toBuffer();

  const meta = await sharp(coverPath).metadata();
  const fw = 640;
  const fh = Math.round((fw * meta.height) / meta.width);
  const fg = await sharp(coverPath).resize(fw, fh, { fit: 'cover' }).toBuffer();
  const fgLeft = Math.round((W - fw) / 2);
  const fgTop = 205;

  const layers = [
    { input: bg, left: 0, top: 0 },
    { input: topShade, left: 0, top: 0 },
  ];

  // 左上角游戏图标（圆角由 SVG 遮罩实现）
  if (g.icon) {
    const iconPath = join(ROOT, 'public', g.icon.replace(/^\//, ''));
    if (existsSync(iconPath)) {
      const iconRaw = await sharp(iconPath).resize(92, 92, { fit: 'cover' }).png().toBuffer();
      const iconMask = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="92" height="92"><rect x="0" y="0" width="92" height="92" rx="20" ry="20" fill="#fff"/></svg>`
      );
      const icon = await sharp(iconRaw)
        .composite([{ input: await sharp(iconMask).png().toBuffer(), blend: 'dest-in' }])
        .png()
        .toBuffer();
      layers.push({ input: icon, left: fgLeft, top: 78 });
    }
  }

  layers.push({ input: fg, left: fgLeft, top: fgTop });

  // 主图细边框
  const frame = await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${fw}" height="${fh}"><rect x="1" y="1" width="${fw - 2}" height="${fh - 2}" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2"/></svg>`
    )
  ).png().toBuffer();
  layers.push({ input: frame, left: fgLeft, top: fgTop });
  layers.push({ input: shade, left: 0, top: 0 });

  await sharp({ create: { width: W, height: H, channels: 3, background: '#0a0a0f' } })
    .composite(layers)
    .webp({ quality: 82 })
    .toFile(join(OUT, `${g.slug}.webp`));

  ok++;
  console.log(`✓ ${g.slug}.webp`);
}

console.log(`\n完成：${ok}/${games.length} 张竖版海报 → public/images/posters/`);

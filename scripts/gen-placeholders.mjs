import { writeFileSync } from 'node:fs';

const covers = [
  ['placeholder-legend', '幻境传说', '#7c5cff', '#b39bff'],
  ['pixel-tactics', '像素征途', '#2bb673', '#7ee0a8'],
  ['card-chronicle', '卡牌编年史', '#ff7a45', '#ffb38a'],
  ['neon-shooter', '霓虹突袭', '#1f9bff', '#7cc8ff'],
  ['idle-tycoon', '放置商栈', '#f5a623', '#ffd27a'],
  ['realm-strategy', '王权纷争', '#e8413c', '#ff8a86'],
];

const coverSvg = (title, c1, c2) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" role="img" aria-label="${title}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
  </linearGradient></defs>
  <rect width="480" height="270" fill="url(#g)"/>
  <text x="24" y="150" font-family="sans-serif" font-size="34" font-weight="700" fill="#ffffff">${title}</text>
  <text x="24" y="186" font-family="sans-serif" font-size="16" fill="rgba(255,255,255,.85)">封面占位图（替换为真实 webp/avif）</text>
</svg>`;

for (const [slug, title, c1, c2] of covers) {
  writeFileSync(`public/images/covers/${slug}.svg`, coverSvg(title, c1, c2));
}

const shotSvg = (n) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" role="img" aria-label="截图${n}">
  <rect width="480" height="270" fill="#dfe3ea"/>
  <rect x="20" y="20" width="440" height="230" rx="12" fill="#ffffff"/>
  <text x="240" y="140" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#9aa3b2">截图 ${n}（占位）</text>
</svg>`;
for (let i = 1; i <= 3; i++) writeFileSync(`public/images/shots/shot-${i}.svg`, shotSvg(i));

// 伪二维码占位（非真实可扫）
const qr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="小程序二维码占位">
  <rect width="200" height="200" fill="#ffffff"/>
  <g fill="#111827">
    <rect x="20" y="20" width="50" height="50"/><rect x="30" y="30" width="30" height="30" fill="#fff"/><rect x="38" y="38" width="14" height="14"/>
    <rect x="130" y="20" width="50" height="50"/><rect x="140" y="30" width="30" height="30" fill="#fff"/><rect x="148" y="38" width="14" height="14"/>
    <rect x="20" y="130" width="50" height="50"/><rect x="30" y="140" width="30" height="30" fill="#fff"/><rect x="38" y="148" width="14" height="14"/>
  </g>
  <g fill="#111827">
    ${Array.from({ length: 36 }, (_, k) => {
      const x = 90 + (k % 6) * 16;
      const y = 90 + Math.floor(k / 6) * 16;
      return (k * 7) % 3 === 0 ? `<rect x="${x}" y="${y}" width="12" height="12"/>` : '';
    }).join('')}
  </g>
</svg>`;
writeFileSync('public/images/mp-qr.svg', qr);

console.log('placeholder images generated');

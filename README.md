# 手游测评 / 攻略站（Astro 静态站）

**游戏海报墙风格**的手游测评与攻略站：纯黑沉浸底、珊瑚红→金黄渐变、毛玻璃固定导航、竖版海报卡、胶囊筛选与快速预览弹窗。基于 **Astro** 构建的零服务器静态站点，SEO 友好，一键部署到 GitHub Pages。

> 📌 本期主推 **《桃园将帅录》** 与 **《小小屠龙》**。游戏信息、封面与截图整理自各游戏官方公开渠道；**本站未做实测**，评分均为「待定」，未核实信息已明确标注。图片版权归原运营方所有，本站仅作介绍用途。

## 技术栈

- [Astro](https://astro.build/)（静态输出 `output: 'static'`）
- 数据驱动：`src/data/games.json`（游戏）+ `src/content/guides/*.md`（攻略，Content Collections）
- 图片管线：
  - `scripts/build-images.mjs`：官方素材 → 统一 webp 压缩
  - `scripts/build-posters.mjs`：官方横图 + 图标 → 3:4 竖版海报（模糊背景 + 清晰主图 + 底部暗渐变）
  - `src/utils/asset.ts`：base 感知路径，保证项目页下资源不 404
- 结构化数据：`VideoGame` / `Article` / `BreadcrumbList` / `WebSite`
- SEO：`robots.txt` 端点、sitemap、canonical、OG/Twitter、自定义 404
- 交互：纯前端胶囊筛选 + 顶部/游戏库双搜索（同页即时筛选）+ 快速预览弹窗 + 客服二维码放大 + 悬浮按钮 / Toast
- 性能：站内链接预取、首屏 LCP 图 preload / fetchpriority、滚动与筛选节流、静态渲染开销收敛
- 部署：GitHub Actions 自动构建并发布到 GitHub Pages
- 收录：可选百度资源平台主动推送（需配置密钥）

## 目录结构

```
.
├── astro.config.mjs          # 站点配置（site/base 按仓库名自动推导）
├── package.json / tsconfig.json
├── .github/workflows/deploy.yml   # 一键部署工作流
├── scripts/
│   ├── build-images.mjs           # 官方素材 → public/images 下的 webp
│   ├── build-posters.mjs          # 官方横图 → 竖版海报 public/images/posters/
│   └── baidu-push.mjs             # 部署后百度 sitemap 推送（无密钥则跳过）
├── src/
│   ├── data/games.ts              # 类型化 schema + 主推/分类派生 + base 感知图片路径
│   ├── data/games.json            # 游戏数据（改这里换内容）
│   ├── utils/asset.ts             # public 资源 base 感知路径工具
│   ├── content.config.ts          # 攻略集合 schema
│   ├── content/guides/*.md        # 攻略文章（Markdown）
│   ├── styles/global.css          # 海报墙 design tokens + 组件样式 + 响应式
│   ├── layouts/BaseLayout.astro   # 固定毛玻璃导航 / 全局搜索 / 页脚 / 悬浮交互
│   ├── components/
│   │   ├── Icon.astro             # 统一线性 SVG 图标（按钮 / 功能图标，currentColor）
│   │   ├── PosterGrid.astro       # 海报网格 + 胶囊筛选 + 搜索 + 快速预览弹窗
│   │   ├── GameCard.astro         # 竖版游戏海报卡
│   │   ├── GuideCard.astro        # 竖版攻略海报卡
│   │   ├── HotScroll.astro        # 热门横滑 4:5 卡片
│   │   ├── FeaturedSpotlight.astro# 主推双大图
│   │   ├── ContactCard.astro      # 首页客服卡（二维码 + 放大弹窗）
│   │   └── ServiceCard.astro      # 详情页 / 攻略页紧凑客服条
│   └── pages/
│       ├── index.astro           # 首页（沉浸 Hero + 主推 + 热门横滑 + 全部游戏 + 攻略 + 客服）
│       ├── library.astro         # 游戏库（海报网格 + 筛选，支持 ?cat= / ?kw= 预筛）
│       ├── games/[slug].astro    # 游戏详情页
│       ├── guides/index.astro    # 攻略库
│       ├── guides/[...slug].astro# 攻略详情页
│       ├── robots.txt.ts / 404.astro
├── public/favicon.svg       # 站点图标（避免浏览器盲请求 /favicon.ico 产生 404）
└── public/images/
    ├── covers/    # 8 张 800×450 封面
    ├── posters/   # 8 张 600×800 竖版海报（海报墙卡片主视觉）
    ├── banners/   # 2 张 1440×810 主推大图
    ├── icons/     # 8 张 128×128 游戏图标
    ├── shots/     # 9 张 720×405 官方游戏截图
    └── service-qr.png  # 客服微信公众号二维码（290×290 无损 PNG，含白色静区）
```

> 客服二维码由站方提供（源文件 `qrcode_for_gh_7c22786de640_258.jpg`），已转为无损 PNG 并补齐白色静区以保证扫码识别率。如需更换，直接覆盖 `public/images/service-qr.png` 即可，组件通过 `asset()` 自动处理项目页路径。

### 按钮与图标规范

- 交互控件里的图标统一用 `Icon.astro` 的内联 SVG（单色 `currentColor`，24×24 viewBox），不依赖系统 emoji 字体；标题、空状态等装饰性 emoji 保留。
- 新增图标：在 `Icon.astro` 的 `shapes` 中加一条路径，用 `<Icon name="..." size={16} />` 调用；纯图标按钮必须带 `aria-label`。
- 按钮基线集中在 `global.css` 末尾的「按钮 / 图标统一规范」区段：`min-height: 44px` 触摸目标、`inline-flex + gap` 图标对齐、`:active` 按压反馈、`:focus-visible` 焦点环与禁用态。
- 移动端（≤768px）海报卡右上角为圆形「快速预览」图标按钮，不占用卡片底部标题空间；筛选按钮用 `aria-pressed` 同步选中态。

### 性能与响应速度

- **切页**：`astro.config.mjs` 开启 `prefetch: { prefetchAll: true, defaultStrategy: 'viewport' }`，链接进入视口 300ms 后由 Astro 注入 `<link rel="prefetch">` 提前取回目标页 HTML；纯锚点链接用 `data-astro-prefetch="false"` 排除。不依赖 ClientRouter，静态多页站也能接近瞬时切换。
- **首屏**：`BaseLayout` 的 `preloadImage` 给 Hero 背景（CSS 背景图浏览器发现得晚）加 `<link rel="preload" as="image" fetchpriority="high">`；首张主推大图 `loading="eager" fetchpriority="high"`，其余 lazy；游戏详情 / 攻略详情首图同样标 high。
- **图片**：规格统一按「实际最大显示宽度 × 2 DPR」定，避免过采样。`build-images.mjs`：COVER 800×450 q76、BANNER 1440×810 q78、ICON 128×128 q80、SHOT 720×405 q74；`build-posters.mjs` 先按 720×960 合成再缩到 600×800 q76（合成坐标不变）。全部图片 **2.2MB → 1.4MB**、构建产物 **2.5MB → 1.7MB**；二维码 PNG 保持无损以保扫码识别率。改参数后需依次重跑两个脚本（依赖 `.assets-src/` 原始素材）再 build。
- **图片加载优先级**：首屏 Hero / 主推首图 / 详情与攻略首图 `fetchpriority="high"`，其余 36 处懒加载图一律 `low`，避免与 LCP 抢带宽；所有 `<img>` 的 width/height 与实际文件一致，不产生 CLS。首页 GameCard、HotScroll 与详情页共用同一海报 URL，浏览器缓存可复用，不额外发请求。
- **渲染**：移除 Hero 的 18s 无限缩放动画（整屏模糊大图会持续参与合成）、导航 `backdrop-filter` 20px → 12px、**去掉卡片分类标签的 `backdrop-filter`**（原来首页十余个模糊层在滚动时同时重算，改半透明实色 + 细边框）、卡片加 `contain: layout style`、`transition: all` 改为具体属性、卡片淡入 0.45s → 0.3s 且错峰封顶 0.14s。
- **交互**：顶部导航搜索在首页 / 游戏库页直接驱动同页海报墙筛选（`preventDefault` + 派发 `input` + `history.replaceState` 同步 URL），不再整页跳转；无海报墙的详情页仍正常跳到游戏库。滚动监听用 rAF 节流且只在显隐状态翻转时写 DOM；长距离滚动（>1400px）改为瞬时；筛选预计算检索文本、改用 `hidden` 属性显隐卡片（配套 CSS `.poster-card[hidden]`）、连续输入合并到一帧；快速预览弹窗大图在 hover / focus 时预热缓存。
- `public/favicon.svg` 显式声明图标，消除浏览器自动请求 `/favicon.ico` 的 404。

## 本地开发

```bash
npm install
npm run dev        # 默认 http://localhost:4321
```

构建与预览产物：

```bash
npm run build      # 输出到 dist/
npm run preview    # 预览构建结果
```

验证线上项目页（`/<repo>/`）下的资源路径：

```bash
GITHUB_REPOSITORY=<owner>/<repo> npm run build
# 检查 dist/index.html 中图片路径是否带 /<repo>/ 前缀
```

## 图片素材

所有游戏图片均来自官方公开渠道，来源已记录在 `scripts/build-images.mjs` 的 `SOURCE_URLS`：

| 来源 | 用途 |
| --- | --- |
| [老炮怀旧手游平台（游昕网络）](http://www.paogf.com) | 两款主推 banner / 封面 / 图标，及其余游戏横图与图标 |
| [《小小屠龙》手游官网](https://xxtlxz.cn) | 小小屠龙游戏内截图 |
| [《桃园：将帅录》手游官网](https://lzgzb.com) | 桃园将帅录游戏内截图 |

重新生成图片：

```bash
node scripts/build-images.mjs    # 官方素材 → 封面 / 横图 / 图标 / 截图
node scripts/build-posters.mjs   # 上述素材 → 竖版海报（新增游戏后务必重跑）
```

> 竖版海报由官方宣传图二次排版生成（模糊背景 + 原图 + 图标），**非游戏官方原图**，页脚已声明。新增游戏时，只要在 `games.json` 里写了 `cover`，`build-posters.mjs` 就会按 `slug` 自动生成 `/images/posters/<slug>.webp`；`src/data/games.ts` 会自动推导该路径，无需手写 `poster` 字段。

> 原始抓取素材放在 `.assets-src/`（已加入 `.gitignore`，不入库）。**所有 public 资源路径必须经 `asset()` 转换**，否则 GitHub Pages 项目页下会 404。

## 一键部署（GitHub Pages）

代码推送到 `main` 分支即自动部署，无需手动构建。

1. 仓库 **Settings → Pages → Source** 选择 **GitHub Actions**（仅需设置一次）
2. 推送 `main` 分支，或到 **Actions** 标签页手动 `Run workflow`
3. 约 1–2 分钟后站点上线：`https://<用户名>.github.io/<仓库名>/`

`astro.config.mjs` 已根据 `GITHUB_REPOSITORY` 自动推导 `base` 与 `site`，**项目页路径直接可用**，本地开发与线上部署互不干扰。

## 内容管理

### 添加 / 修改游戏

编辑 `src/data/games.json`。字段说明（详见 `src/data/games.ts` 注释）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `slug` | string | 是 | URL 标识，唯一；同时决定海报文件名 |
| `title` / `category` | string | 是 | 游戏名 / 分类（用于胶囊筛选） |
| `badge` | `'pick'\|'new'\|'hot'\|''` | 是 | `pick` = 主推（首页大图展示）；另用于热门横滑筛选 |
| `cover` | string | 是 | 16:9 封面，public 下绝对路径 |
| `poster` | string | 否 | 3:4 竖版海报；缺省自动取 `/images/posters/<slug>.webp` |
| `hero` | string | 否 | 主推大图 banner，`badge='pick'` 时首页展示 |
| `icon` | string | 否 | 1:1 游戏图标 |
| `status` | string | 是 | 运营/规模状态文案；**不编造在线人数**，未知填「以官方为准」 |
| `description` | string | 是 | 结论先行的简介（海报卡 2 行截断） |
| `platform` / `tags` | string[] | 是 | 平台 / 玩法标签（参与搜索） |
| `rating` | number \| null | 是 | 评分；未实测填 `null`（显示「待定」） |
| `price` | string | 是 | 现价文案（如「免费下载」） |
| `developer` | string | 否 | 信息来源 / 运营方（详情页展示） |
| `screenshots` | string[] | 否 | 截图画廊（空数组 → 隐藏） |

### 添加攻略

在 `src/content/guides/` 新建 `.md` 文件，frontmatter 示例：

```markdown
---
title: 桃园将帅录 新手入门
summary: 结论先行的新手攻略……
gameSlug: taoyuan-jiangshuailu   # 填对应游戏 slug 自动互链
category: 新手入门
cover: /images/shots/taoyuan-2.webp
tags: [桃园将帅录, 新手, 配队]
author: 编辑部
date: 2026-11-05
---

正文用 Markdown 撰写……
```

> 攻略正文里**不要写 `/xxx` 开头的站内绝对链接**（项目页下会断链），如需互链请用页面组件里的 `BASE` 拼接。

## 百度收录推送（可选）

部署后自动向百度资源平台推送 sitemap。仅当你配置了仓库密钥时才会执行，否则自动跳过：

- **Settings → Secrets and variables → Actions → New repository secret**
  - `BAIDU_SITE`：百度资源平台已验证的站点地址（建议为自定义域名）
  - `BAIDU_TOKEN`：普通收录 → 主动推送 中的 token

> 注意：GitHub Actions 的 `if:` 条件中**不允许使用 `secrets` 上下文**，因此推送步骤不设 `if` 守卫，改由脚本内部在缺密钥时自动跳过。

## ⚠️ 自定义域名红线（务必遵守）

按项目铁律，**挂载自定义域名前必须按序完成**：

1. **ICP 备案** 完成
2. **DNS 解析** 就绪
3. 再在 GitHub Pages 中**挂载域名并强制 HTTPS**

备案 / DNS 未就绪前**切勿挂载域名**，否则全站可能宕机。百度推送的 `BAIDU_SITE` 也应填最终生效的域名，否则推送会因域名不匹配失败。

## 合规与内容声明

- 本站为独立测评介绍站，非游戏官方站点；不代收任何费用，也不处理充值与账号问题。
- 客服入口为站方提供的公众号二维码，扫码后按公众号指引咨询；页面已提示「请勿向任何私人账号转账」。
- 内容与图片整理自官方公开渠道，图片版权归原运营方所有；如需商用请先取得授权。
- 竖版海报为官方宣传图的二次排版示意图，非官方原图。
- 数据以官方公告为准；未核实信息均明确标注，绝不编造在线人数、评分与实测结论。
- 测评结论先行，优劣分明；涉及账号、付费等高风险操作先提示确认。

# 手游测评 / 攻略站（Astro 静态站）

真实、克制、结论先行的手游测评与攻略站。基于 **Astro** 构建的零服务器静态站点，SEO 友好，可一键部署到 GitHub Pages。

> 📌 本期主推 **《桃园将帅录》** 与 **《小小屠龙》**。游戏信息、封面与截图整理自各游戏官方公开渠道；**本站未做实测**，评分均为「待定」，未核实信息已明确标注。图片版权归原运营方所有，本站仅作介绍用途。

## 技术栈

- [Astro](https://astro.build/)（静态输出 `output: 'static'`）
- 数据驱动：`src/data/games.json`（游戏）+ `src/content/guides/*.md`（攻略，Content Collections）
- 图片管线：`scripts/build-images.mjs`（官方素材 → 统一 webp 压缩/尺寸归一）+ `src/utils/asset.ts`（base 感知路径）
- 结构化数据：游戏详情 `VideoGame`、攻略 `Article`、全站面包屑 `BreadcrumbList`、站点 `WebSite`
- SEO：`robots.txt` 端点、sitemap、canonical、OG/Twitter、自定义 404
- 部署：GitHub Actions 自动构建并发布到 GitHub Pages
- 收录：可选百度资源平台主动推送（需配置密钥）

## 目录结构

```
.
├── astro.config.mjs          # 站点配置（site/base 按仓库名自动推导）
├── package.json
├── tsconfig.json
├── .github/workflows/deploy.yml   # 一键部署工作流
├── scripts/
│   ├── build-images.mjs           # 从官方素材生成 public/images 下的 webp
│   └── baidu-push.mjs             # 部署后百度 sitemap 推送（无密钥则跳过）
├── src/
│   ├── data/games.ts              # 类型化 schema + 主推/分类派生 + base 感知图片路径
│   ├── data/games.json            # 游戏数据（改这里换内容）
│   ├── utils/asset.ts             # public 资源 base 感知路径工具
│   ├── content.config.ts          # 攻略集合 schema
│   ├── content/guides/*.md        # 攻略文章（Markdown）
│   ├── styles/global.css          # design tokens + 响应式 + 暗色主题
│   ├── layouts/BaseLayout.astro   # SEO head、导航、页脚、来源声明
│   ├── components/
│   │   ├── FeaturedSpotlight.astro # 首页主推大图（官方 banner）
│   │   ├── FeaturedGrid.astro      # 更多收录卡片
│   │   ├── GameCard.astro / GameLibrary.astro
│   │   ├── GuideCard.astro
│   │   └── OfficialChannels.astro  # 主推游戏官网入口
│   └── pages/
│       ├── index.astro           # 首页（Hero + 主推 + 更多收录 + 最新攻略）
│       ├── library.astro         # 游戏库（前端筛选，?cat= 预筛）
│       ├── games/[slug].astro    # 游戏详情页
│       ├── guides/index.astro    # 攻略库
│       ├── guides/[...slug].astro# 攻略详情页
│       ├── robots.txt.ts / 404.astro
└── public/images/
    ├── covers/    # 8 张 16:9 封面
    ├── banners/   # 2 张主推大图
    ├── icons/     # 8 张游戏图标
    └── shots/     # 9 张官方游戏截图
```

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

重新生成图片（源素材缺失时会按 `SOURCE_URLS` 自动重新抓取）：

```bash
node scripts/build-images.mjs
```

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
| `slug` | string | 是 | URL 标识，唯一 |
| `title` / `category` | string | 是 | 游戏名 / 分类（用于筛选） |
| `badge` | `'pick'\|'new'\|'hot'\|''` | 是 | `pick` = 主推（首页大图展示） |
| `cover` | string | 是 | 16:9 封面，public 下绝对路径 |
| `hero` | string | 否 | 主推大图 banner，`badge='pick'` 时首页展示 |
| `icon` | string | 否 | 1:1 游戏图标 |
| `status` | string | 是 | 运营/规模状态文案；**不编造在线人数**，未知填「以官方为准」 |
| `description` | string | 是 | 结论先行的简介 |
| `platform` / `tags` | string[] | 是 | 平台 / 玩法标签 |
| `rating` | number \| null | 是 | 评分；未实测填 `null`（显示「待定」） |
| `price` | string | 是 | 现价文案（如「免费下载」） |
| `developer` | string | 否 | 信息来源 / 运营方（详情页展示） |
| `externalUrl` | string | 是 | 官网地址 |
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

- 本站为独立测评介绍站，非游戏官方站点；不代收任何费用。
- 内容与图片整理自官方公开渠道，图片版权归原运营方所有；如需商用请先取得授权。
- 数据以官方公告为准；未核实信息均明确标注，绝不编造在线人数、评分与实测结论。
- 测评结论先行，优劣分明；涉及账号、付费等高风险操作先提示确认。

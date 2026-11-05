# 手游测评 / 攻略站（Astro 静态站）

真实、克制、结论先行的手游测评与攻略站。基于 **Astro** 构建的零服务器静态站点，SEO 友好，可一键部署到 GitHub Pages。

> ⚠️ 当前仓库示例数据为**演示内容**（顶部有可关闭的「演示数据」横幅），请按下方说明替换为真实内容后再正式对外运营。

## 技术栈

- [Astro](https://astro.build/)（静态输出 `output: 'static'`）
- 数据驱动：`src/data/games.json`（游戏）+ `src/content/guides/*.md`（攻略，Content Collections）
- 结构化数据：游戏详情 `VideoGame`、攻略 `Article`、全站面包屑 `BreadcrumbList`、站点 `WebSite`
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
│   ├── gen-placeholders.mjs       # 重新生成占位图
│   └── baidu-push.mjs             # 部署后百度 sitemap 推送（无密钥则跳过）
├── src/
│   ├── data/games.ts              # 类型化 schema + 派生字段
│   ├── data/games.json            # 游戏数据（改这里换内容）
│   ├── content.config.ts          # 攻略集合 schema
│   ├── content/guides/*.md        # 攻略文章（Markdown）
│   ├── styles/global.css          # design tokens + 响应式 + 暗色主题
│   ├── layouts/BaseLayout.astro   # SEO head、导航、页脚、跳转链接
│   ├── components/                # GameCard / FeaturedGrid / GameLibrary
│   │                             # GuideCard / MiniProgramEntry
│   └── pages/
│       ├── index.astro           # 首页（Hero + 精品推荐 + 最新攻略）
│       ├── library.astro         # 游戏库（前端筛选，?cat= 预筛）
│       ├── games/[slug].astro    # 游戏详情页
│       ├── guides/index.astro    # 攻略库
│       ├── guides/[...slug].astro# 攻略详情页
│       ├── robots.txt.ts         # 动态 robots
│       └── 404.astro             # 自定义 404
└── public/images/                # 封面 / 截图 / 小程序二维码（占位图）
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

重新生成占位图（换真实封面前可忽略）：

```bash
node scripts/gen-placeholders.mjs
```

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
| `title` | string | 是 | 游戏名 |
| `category` | string | 是 | 分类（用于筛选） |
| `badge` | `'pick'\|'new'\|'hot'\|''` | 是 | 角标 |
| `cover` | string | 是 | 封面图路径 |
| `rating` | number \| null | 是 | 评分（null → 显示「待定」） |
| `price` | string | 是 | 现价文案（`免费` / `¥68`） |
| `originalPrice` | string | 否 | 划线原价 |
| `developer` / `releaseDate` | string | 否 | 开发商 / 上线日期 |
| `externalUrl` | string | 是 | 外部下载 / 官网 |
| `screenshots` | string[] | 否 | 截图画廊（空则隐藏） |

### 添加攻略

在 `src/content/guides/` 新建 `.md` 文件，frontmatter 示例：

```markdown
---
title: 卡牌编年史 PVP 对位与节奏
summary: 结论先行的 PVP 攻略……
gameSlug: card-chronicle     # 填对应游戏 slug 自动互链
category: PVP
cover: /images/covers/card-chronicle.svg
tags: [PVP, 对位]
author: 编辑部
date: 2026-11-05
---

正文用 Markdown 撰写……
```

## 百度收录推送（可选）

部署后自动向百度资源平台推送 sitemap。仅当你配置了仓库密钥时才会执行，否则自动跳过：

- **Settings → Secrets and variables → Actions → New repository secret**
  - `BAIDU_SITE`：百度资源平台已验证的站点地址（建议为自定义域名）
  - `BAIDU_TOKEN`：普通收录 → 主动推送 中的 token

## ⚠️ 自定义域名红线（务必遵守）

按项目铁律，**挂载自定义域名前必须按序完成**：

1. **ICP 备案** 完成
2. **DNS 解析** 就绪
3. 再在 GitHub Pages 中**挂载域名并强制 HTTPS**

备案 / DNS 未就绪前**切勿挂载域名**，否则全站可能宕机。百度推送的 `BAIDU_SITE` 也应填最终生效的域名，否则推送会因域名不匹配失败。

## 合规与内容声明

- 数据以官方为准；未核实信息均明确标注，绝不编造。
- 测评结论先行，优劣分明；高风险操作（如账号、付费）先提示确认。

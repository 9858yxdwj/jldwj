// 游戏库数据 schema（类型 + 字段说明）
// 对应 AI-PROMPTS.md 第二节「游戏数据 schema」，并补充 price/originalPrice/icon/hero 等字段。
//
// 字段           类型              必填   用途
// id             string           是     内部唯一标识（不用于 URL）
// slug           string           是     URL 友好的唯一标识，详情页路由用 /games/<slug>
// title          string           是     游戏名
// category       string           是     分类（三国策略/传奇/武侠/科幻…）
// badge          string           否     角标：'pick'主推 | 'new'新游 | 'hot'热门 | ''无
// cover          string           是     封面图路径（16:9 webp，public 下）
// hero           string           否     主推大图 banner（badge='pick' 时首页展示）
// icon           string           否     游戏图标（1:1 webp，详情页/主推区展示）
// status         string           是     运营/规模状态文案（如 "三端互通"；不编造在线人数，未知填「官方未公布」）
// description    string           是     简介（列表卡片 2 行截断，详情页可作正文摘要）
// platform       string[]         是     平台（iOS/Android/PC…）
// tags           string[]         是     玩法标签
// rating         number|null      否     评分（null → 列表/详情显示「待定」）
// price          string           是     现价文案（"免费" / "点卡制"）
// originalPrice  string           否     划线原价（可选）
// developer      string           否     开发商/运营方（详情页展示）
// releaseDate    string           否     上线日期（详情页展示，如 "2026-10"）
// externalUrl    string           是     外部下载/官网地址
// screenshots    string[]         否     截图画廊（空数组 → 详情页隐藏画廊）
import gamesData from './games.json';
import { asset } from '../utils/asset';

export interface Game {
  id: string;
  slug: string;
  title: string;
  category: string;
  badge: 'pick' | 'new' | 'hot' | '';
  cover: string;
  hero?: string;
  icon?: string;
  status: string;
  description: string;
  platform: string[];
  tags: string[];
  rating: number | null;
  price: string;
  originalPrice?: string;
  developer?: string;
  releaseDate?: string;
  externalUrl: string;
  screenshots: string[];
}

// 统一把 public 下的图片路径转成 base 感知，避免项目页部署时图片 404
export const games: Game[] = (gamesData as unknown as Game[]).map((g) => ({
  ...g,
  cover: asset(g.cover),
  hero: g.hero ? asset(g.hero) : undefined,
  icon: g.icon ? asset(g.icon) : undefined,
  screenshots: (g.screenshots ?? []).map(asset),
}));

/** 主推游戏（首页大图展示，按数据顺序） */
export const featuredGames = games.filter((g) => g.badge === 'pick' && g.hero);

export const CATEGORY_LIST = [...new Set(games.map((g) => g.category))];
export const BADGE_MAP: Record<string, string> = {
  pick: '主推',
  new: '新游',
  hot: '热门',
};

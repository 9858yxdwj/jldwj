// 游戏库数据 schema（类型 + 字段说明）
// 对应 AI-PROMPTS.md 第二节「游戏数据 schema」，并补充 price/originalPrice 以支持详情页「价格(划线价)」。
//
// 字段           类型              必填   用途
// id             string           是     内部唯一标识（不用于 URL）
// slug           string           是     URL 友好的唯一标识，详情页路由用 /games/<slug>
// title          string           是     游戏名
// category       string           是     分类（角色扮演/策略战棋/卡牌/射击/模拟经营/放置挂机…）
// badge          string           否     角标：'pick'精选 | 'new'新游 | 'hot'热门 | ''无
// cover          string           是     封面图路径（public 下，建议 webp/avif）
// players        string           是     在玩人数展示文案（如 "120万+"）
// description    string           是     简介（列表卡片 2 行截断，详情页可作正文摘要）
// platform       string[]         是     平台（iOS/Android/PC…）
// tags           string[]         是     玩法标签
// rating         number|null      否     评分（null → 列表/详情显示「待定」）
// price          string           是     现价文案（"免费" / "¥68"）
// originalPrice  string           否     划线原价（可选）
// developer      string           否     开发商（详情页展示）
// releaseDate    string           否     上线日期（详情页展示，如 "2025-03"）
// externalUrl    string           是     外部下载/官网地址
// screenshots    string[]         否     截图画廊（空数组 → 详情页隐藏画廊）
import gamesData from './games.json';

export interface Game {
  id: string;
  slug: string;
  title: string;
  category: string;
  badge: 'pick' | 'new' | 'hot' | '';
  cover: string;
  players: string;
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

export const games = gamesData as unknown as Game[];

export const CATEGORY_LIST = [...new Set(games.map((g) => g.category))];
export const BADGE_MAP: Record<string, string> = {
  pick: '精选',
  new: '新游',
  hot: '热门',
};

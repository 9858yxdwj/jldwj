/**
 * 临时下架的游戏名单（等通知后再恢复展示）。
 *
 * 列进来的 slug 会在 src/data/games.ts 统一过滤，因此：
 *  - 首页、游戏库、热门横滑、分类筛选里都不会出现；
 *  - 不会生成 /games/<slug>/ 详情页，也不会进 sitemap；
 *  - games.json 里的游戏数据与 public 下的图片都保留，不做删除。
 *
 * 恢复展示：把对应 slug 从这个数组里删掉，重新构建即可，不用改别的文件。
 */
// 剑与翼（魔幻）、机战：钢铁巨舰（科幻）
export const HIDDEN_GAME_SLUGS: string[] = ['jian-yu-yi', 'jizhan-gangtie'];

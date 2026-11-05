/**
 * 静态资源路径工具
 * ------------------------------------------------------------------
 * 站点部署在 GitHub Pages 项目页时位于 /<repo>/ 子路径下，
 * 直接使用 "/images/xxx.webp" 会指向站根导致 404。
 * 所有 public 下的资源都应通过 asset() 生成路径。
 */
const BASE = import.meta.env.BASE_URL;

export function asset(path: string): string {
  if (!path) return path;
  // 外链 / data URI 原样返回
  if (/^(https?:\/\/|data:)/i.test(path)) return path;
  return `${BASE}${path.replace(/^\//, '')}`;
}

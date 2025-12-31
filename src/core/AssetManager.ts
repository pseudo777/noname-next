// src/core/AssetManager.ts

// 1. 定义资源的基础路径
// 开发环境(DEV): 使用本地 public 目录
// 生产环境(PROD): 将来指向 CDN (如 https://cdn.jsdelivr.net/...)
const BASE_URL = import.meta.env.DEV
  ? "/assets"
  : "https://your-cdn.com/assets";

export const assetManager = {
  /**
   * 获取通用的资源 URL
   */
  getUrl(path: string): string {
    // 移除开头多余的斜杠
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${BASE_URL}/${cleanPath}`;
  },

  /**
   * 专门获取武将头像
   * 约定优于配置：默认文件名就是 ID.jpg
   */
  getCharacterAvatar(charId: string): string {
    return this.getUrl(`characters/${charId}.jpg`);
  },

  /**
   * 获取卡牌图片 (预留)
   */
  getCardImage(cardName: string): string {
    return this.getUrl(`cards/${cardName}.png`);
  },
};

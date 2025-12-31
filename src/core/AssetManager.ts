// src/core/AssetManager.ts

// 1. 定义资源的基础路径
// 开发环境(DEV): 使用本地 public 目录
// 生产环境(PROD): 将来指向 CDN (如 https://cdn.jsdelivr.net/...)
const BASE_URL = import.meta.env.DEV
  ? "/assets"
  : "https://your-cdn.com/assets";

// 1. 配置你的 CDN 前缀
// 请替换成你自己的用户名和资源仓库名
const CDN_PREFIX = "https://cdn.jsdelivr.net/gh/pseudo777/noname-assets@main";

export const assetManager = {
  /**
   * 获取通用的资源 URL
   */
  getUrl(path: string): string {
    // 移除开头多余的斜杠
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    // 🌟 核心判断：
    // 如果是生产环境 (import.meta.env.PROD 为 true)，走 CDN
    // 如果是开发环境 (bun dev)，依然走本地 public 目录
    if (import.meta.env.PROD) {
      return `${CDN_PREFIX}/${cleanPath}`;
    } else {
      // 本地开发，依然使用 /assets/...
      // 注意：这里的前提是你本地 public/assets 下还有图片用于测试
      return `/assets/${cleanPath}`;
    }
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

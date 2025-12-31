// src/core/Logger.svelte.ts
import type { LogEntry, LogSegment } from "./types/log";

export class Logger {
  // 响应式数组：一旦这里有变化，UI 会自动更新
  entries = $state<LogEntry[]>([]);

  /**
   * 核心方法：添加一条日志
   * 为了调用方便，我们允许传入不定参数
   */
  add(...segments: (string | LogSegment)[]) {
    const parsedSegments: LogSegment[] = segments.map((seg) => {
      // 如果传的是纯字符串，自动转为 normal 类型
      if (typeof seg === "string") {
        return { text: seg, type: "normal" };
      }
      return seg;
    });

    const entry: LogEntry = {
      id: Math.random().toString(36).slice(2),
      timestamp: Date.now(),
      segments: parsedSegments,
    };

    this.entries.push(entry);

    // 限制日志最大数量 (比如只保留最近 50 条)，防止内存溢出
    if (this.entries.length > 50) {
      this.entries.shift();
    }
  }

  // --- 快捷辅助方法 ---

  // 快速生成玩家片段
  player(p: { name: string; id: string }): LogSegment {
    return { text: `[${p.name}]`, type: "player", id: p.id };
  }

  // 快速生成卡牌片段
  card(name: string): LogSegment {
    return { text: `【${name}】`, type: "card" };
  }

  // 快速生成技能片段
  skill(name: string): LogSegment {
    return { text: `『${name}』`, type: "skill" };
  }
}

// 导出单例
export const logger = new Logger();

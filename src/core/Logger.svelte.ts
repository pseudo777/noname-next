import type { Player } from "./Player.svelte";
import type { CardInstance } from "./api/CardInstance";

// 日志片段类型：支持纯文本、玩家对象、卡牌对象、数值
export type LogSegment =
  | string
  | { type: "player"; name: string; id: string; isMe: boolean }
  | { type: "card"; name: string; suit: string; point: number }
  | { type: "damage"; amount: number }
  | { type: "recover"; amount: number };

export interface LogEntry {
  id: string;
  timestamp: number;
  segments: LogSegment[];
}

class Logger {
  logs = $state<LogEntry[]>([]);

  // 转换玩家对象为日志片段
  player(p: Player): LogSegment {
    return { type: "player", name: p.name, id: p.uid, isMe: false }; // isMe 在 UI 层判断
  }

  // 转换卡牌对象为日志片段
  card(c: CardInstance | string): LogSegment {
    if (typeof c === "string") {
      return { type: "card", name: c, suit: "none", point: 0 };
    }
    return { type: "card", name: c.name, suit: c.suit, point: c.point };
  }

  // 核心方法：添加一条日志
  add(...args: (string | LogSegment | Player | CardInstance)[]) {
    const segments: LogSegment[] = args.map((arg) => {
      if (typeof arg === "string") return arg;
      // 简单的类型检测
      if (this.isPlayer(arg)) return this.player(arg);
      if (this.isCard(arg)) return this.card(arg);
      return arg as LogSegment;
    });

    this.logs.push({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      segments,
    });

    // 保持日志数量在合理范围
    if (this.logs.length > 50) {
      this.logs.shift();
    }
  }

  // 类型守卫 (简化版)
  private isPlayer(arg: any): arg is Player {
    return arg && typeof arg === "object" && "uid" in arg && "hand" in arg;
  }

  private isCard(arg: any): arg is CardInstance {
    return (
      arg && typeof arg === "object" && "suit" in arg && "definitionName" in arg
    );
  }
}

export const logger = new Logger();

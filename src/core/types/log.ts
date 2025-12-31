// src/core/types/log.ts

export type LogType =
  | "normal"
  | "player"
  | "card"
  | "skill"
  | "damage"
  | "heal";

export interface LogSegment {
  text: string;
  type: LogType;
  id?: string; // 可选：如果有ID，点击可以查看详情
}

export interface LogEntry {
  id: string; // 每条日志的唯一ID (用于 v-for key)
  segments: LogSegment[];
  timestamp: number;
}

// src/core/types/core.ts
import type { Game } from "../Game.svelte";
import type { Player } from "../Player.svelte";

// --- 基础枚举 ---
export type Suit = "spade" | "heart" | "club" | "diamond" | "none";
export type CardType = "basic" | "scroll" | "equip";
export type Kingdom = "wei" | "shu" | "wu" | "qun" | "god";

// --- 1. 卡牌系统 ---

// 逻辑定义 (Logic)
export interface CardDefinition {
  name: string; // 唯一ID (如 "sha")
  displayName: string; // 中文名 (如 "杀")
  type: CardType;
  description?: string;

  // 钩子：能否使用
  canUse: (game: Game, user: Player, targets: Player[]) => boolean;
  // 钩子：执行效果
  execute: (game: Game, user: Player, targets: Player[]) => Promise<void>;
}

// 牌堆配置 (Data)
export interface CardConfig {
  suit: Suit;
  point: number;
  name: string; // 指向 CardDefinition.name
}

// --- 2. 技能系统 ---

// 技能上下文
export interface TriggerContext {
  game: Game;
  player: Player;
  data?: any; // 事件数据(比如造成了多少伤害)
}

// 逻辑定义 (Logic)
export interface SkillDefinition {
  name: string; // ID (如 "jianxiong")
  displayName: string; // 中文名
  description: string;

  // 简单的钩子 (这里只是示例结构，实际可能会更复杂)
  onDamage?: (ctx: TriggerContext) => Promise<void>;
  onPhaseStart?: (ctx: TriggerContext) => Promise<void>;
}

// --- 3. 武将系统 ---

// 数据定义 (Data)
export interface CharacterDefinition {
  id: string; // ID (如 "caocao")
  name: string; // 中文名
  kingdom: Kingdom; // 势力
  maxHp: number; // 血量
  skills: string[]; // 拥有的技能ID列表
  // 暂时不处理图片，UI层可以根据ID拼路径
}

// --- 4. 模组包 (Package) ---
export interface GamePackage {
  id: string;
  name: string;

  cards?: CardDefinition[]; // 注册卡牌逻辑
  deck?: CardConfig[]; // 牌堆数据

  skills?: SkillDefinition[]; // 注册技能逻辑
  characters?: CharacterDefinition[]; // 注册武将数据
}

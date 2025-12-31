// src/core/types/api.ts

export interface ModManifest {
  id: string; // 扩展包ID
  characters: CharacterDef[]; // 这个包里包含的武将
}

// 1. 定义 Hook 的上下文
// 当发生“造成伤害”这件事时，我们需要知道这些信息
export interface DamageContext {
  source?: any; // 伤害来源 (暂时用 any，后面改成 Player)
  target: any; // 伤害目标 (Player)
  amount: number; // 伤害数值
  type?: "normal" | "fire" | "thunder";
}

// 2. 定义技能结构
export interface SkillDef {
  id: string;
  name: string;
  description: string;

  // 钩子函数集合
  hooks?: {
    // 这是一个“拦截器”：在扣血之前触发
    onBeforeDamage?: (ctx: DamageContext) => void;
  };
}

// 3. 修改武将定义，增加 skills 字段
export interface CharacterDef {
  // ... 原有字段 ...
  id: string;
  name: string;
  maxHp: number;
  country: "wei" | "shu" | "wu" | "qun";

  skills?: string[]; // 新增: 拥有的技能ID列表
}

// 4. 修改扩展包定义
export interface ModManifest {
  id: string;
  characters: CharacterDef[];
  skills?: SkillDef[]; // 新增: 包含的技能
}

export type Suit = "spade" | "heart" | "club" | "diamond"; // 黑桃 红桃 梅花 方片

export interface CardDef {
  id: string; // 唯一ID (用于逻辑判等)
  name: string; // 显示名称 "杀"
  suit: Suit; // 花色
  point: number; // 点数 1-13
  type: "basic" | "trick" | "equip"; // 基本/锦囊/装备

  // 后面我们会在这里加 hooks，比如 onUse
}

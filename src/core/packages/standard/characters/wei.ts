// src/core/packages/standard/characters/wei.ts
import type { CharacterDefinition, SkillDefinition } from "../../../types/core";

// 技能逻辑
export const JIANXIONG: SkillDefinition = {
  name: "jianxiong",
  displayName: "奸雄",
  description: "受到伤害后，获得造成伤害的牌",
  onDamage: async (ctx) => {
    console.log("奸雄触发！(逻辑待完善)");
  },
};

// 武将数据
export const CAOCAO: CharacterDefinition = {
  id: "caocao",
  name: "曹操",
  kingdom: "wei",
  maxHp: 4,
  skills: ["jianxiong"],
};

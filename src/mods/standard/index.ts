// src/mods/standard/index.ts
import type { ModManifest, DamageContext } from "@core/types/api";
import { logger } from "@core/Logger.svelte";

export const StandardPack: ModManifest = {
  id: "standard_pack",

  // 定义技能
  skills: [
    {
      id: "tiebi", // 铁壁
      name: "铁壁",
      description: "被动技，受到的伤害 -1",
      hooks: {
        // 这就是 Mod 的威力：直接修改游戏规则
        onBeforeDamage: (ctx: DamageContext) => {
          ctx.amount -= 1;
          if (ctx.amount < 0) ctx.amount = 0;
          logger.add(logger.skill("铁壁"), " 触发，抵消了 1 点伤害");
        },
      },
    },
  ],

  // 给曹操装上“铁壁”
  characters: [
    {
      id: "caocao",
      name: "曹操",
      maxHp: 4,
      country: "wei",
      skills: ["tiebi"], // <--- 关联技能
    },
    { id: "liubei", name: "刘备", maxHp: 1, country: "shu" },
    { id: "sunquan", name: "孙权", maxHp: 4, country: "wu" },
    { id: "lvbu", name: "吕布", maxHp: 1, country: "qun" },
  ],
};

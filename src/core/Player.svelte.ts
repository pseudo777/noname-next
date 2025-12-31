// src/core/Player.svelte.ts
import { Health } from "./modules/Health.svelte";
import type { CharacterDef, DamageContext, CardDef, Suit } from "./types/api";
import { modManager } from "./ModManager";
import { logger } from "./Logger.svelte";

export class Player {
  id: string;
  name = $state("");
  country = $state("");
  health: Health;
  hand = $state<CardDef[]>([]);

  // 存储当前武将拥有的技能对象
  skills = $state<any[]>([]);

  constructor(def: CharacterDef) {
    this.id = def.id;
    this.name = def.name;
    this.country = def.country;
    this.health = new Health(def.maxHp);

    // 初始化技能
    if (def.skills) {
      def.skills.forEach((skillId) => {
        const skill = modManager.getSkill(skillId);
        // --- 添加这行调试代码 ---
        console.log(
          `[Debug] 武将 ${this.name} 尝试加载技能: ${skillId}, 结果:`,
          skill
        );
        if (skill) {
          this.skills.push(skill);
        }
      });
    }
    // --- 再加一行确认最终结果 ---
    console.log(
      `[Debug] 技能列表:`,
      this.skills.map((s) => s.name)
    );
  }

  // --- 核心逻辑升级 ---

  // 现在的 damage 不再直接扣血，而是先跑一遍 Hook
  damage(amount: number = 1) {
    // 1. 构建上下文 (Context)
    const ctx: DamageContext = {
      target: this,
      amount: amount,
    };

    // --- 添加这行调试代码 ---
    console.log(`[Debug] 准备扣血，当前技能数: ${this.skills.length}`);

    // 2. 遍历自己的所有技能，看看有没有要拦截的
    // (在完整引擎中，这里还会遍历装备、场上其他人的技能)
    for (const skill of this.skills) {
      if (skill.hooks?.onBeforeDamage) {
        console.log(`[Engine] 触发技能: ${skill.name}`);
        // 执行钩子，允许技能修改 ctx
        skill.hooks.onBeforeDamage(ctx);
      }
    }

    // 3. 结算最终数值
    if (ctx.amount > 0) {
      this.health.damage(ctx.amount);
      logger.add(
        logger.player(this),
        " 受到了 ",
        { text: `${ctx.amount}点`, type: "damage" },
        " 伤害"
      );
    } else {
      logger.add(logger.player(this), " 的伤害被防止了");
    }
  }

  drawCard() {
    const names = ["杀", "闪", "桃", "酒"];
    const suits: Suit[] = ["spade", "heart", "club", "diamond"];

    const newCard: CardDef = {
      id: Math.random().toString(36).slice(2), // 临时随机ID
      name: names[Math.floor(Math.random() * names.length)],
      suit: suits[Math.floor(Math.random() * suits.length)],
      point: Math.floor(Math.random() * 13) + 1,
      type: "basic",
    };

    this.hand.push(newCard);
  }
}

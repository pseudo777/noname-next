import { Health } from "./modules/Health.svelte";
import type { CharacterDefinition, SkillDefinition } from "./types/core";
import type { CardInstance } from "./api/CardInstance";
import { skillManager } from "./managers/SkillManager";
import { game } from "./Game.svelte";
import { logger } from "./Logger.svelte";

export class Player {
  uid = Math.random().toString(36).slice(2);
  id: string; // Character ID
  name = $state("");
  country = $state("");
  hp: Health;

  hand = $state<CardInstance[]>([]);
  skills: SkillDefinition[] = [];

  constructor(def: CharacterDefinition) {
    this.id = def.id;
    this.name = def.name;
    this.country = def.kingdom;
    this.hp = new Health(def.maxHp);

    // 加载技能
    def.skills.forEach((sid) => {
      const s = skillManager.get(sid);
      if (s) this.skills.push(s);
    });
  }

  async drawCard(n: number) {
    const cards = game.drawCardsFromDeck(n);
    this.hand.push(...cards);
    // logger.add(logger.player(this), ` 摸了 ${n} 张牌`);
  }

  async damage(n: number) {
    if (n <= 0) return;
    this.hp.damage(n);
    logger.add(logger.player(this), ` 受到 ${n} 点伤害`);

    // 触发受伤技能
    for (const s of this.skills) {
      if (s.onDamage)
        await s.onDamage({ game, player: this, data: { amount: n } });
    }

    if (this.hp.current <= 0) {
      await game.handleDying(this);
    }
  }

  recover(n: number) {
    this.hp.recover(n);
    logger.add(logger.player(this), ` 回复了 ${n} 点体力`);
  }
}

// src/core/Game.svelte.ts
import { Player } from "./Player.svelte";
import type { CharacterDef } from "./types/api";
import { logger } from "./Logger.svelte";

export class Game {
  // 玩家列表
  players = $state<Player[]>([]);

  // 当前操作的玩家索引
  currentIdx = $state(0);

  // 谁是主视角（就是屏幕前的你）
  // $derived: 假设第一个玩家总是“我”
  me = $derived(this.players[0]);

  /**
   * 初始化一局游戏
   * @param myCharDef 我选的武将
   * @param enemyCharDef 敌人选的武将
   */
  start(myCharDef: CharacterDef, enemyCharDef: CharacterDef) {
    // 创建我
    const p1 = new Player(myCharDef);
    // 创建敌人
    const p2 = new Player(enemyCharDef);

    // 初始手牌 (作弊: 给每人发 4 张)
    for (let i = 0; i < 4; i++) {
      p1.drawCard();
      p2.drawCard();
    }

    this.players = [p1, p2];

    logger.add("游戏开始！");
  }

  /**
   * 核心逻辑：使用卡牌
   * @param cardId 使用的卡牌ID
   * @param targetId 目标的ID (如果是杀，必须有目标)
   */
  useCard(cardId: string, targetId?: string) {
    const user = this.me; // 暂时只处理我出牌
    const cardIdx = user.hand.findIndex((c) => c.id === cardId);
    if (cardIdx === -1) return;

    const card = user.hand[cardIdx];

    // 寻找目标对象
    let target: Player | undefined;
    if (targetId) {
      target = this.players.find((p) => p.uid === targetId);
    }

    // --- 简单的规则判断 ---
    if (card.name === "杀") {
      if (!target) {
        logger.add("错误：使用【杀】必须指定目标！");
        return;
      }
      logger.add(
        logger.player(user),
        " 对 ",
        logger.player(target),
        " 使用了 ",
        logger.card(card.name)
      );

      // 造成伤害 (触发 Hook)
      target.damage(1);
    } else if (card.name === "桃") {
      // 桃只能对自己用 (简化版规则)
      logger.add(logger.player(user), " 吃了一个 ", logger.card(card.name));
      user.health.recover(1);
    }

    // 弃牌
    user.hand.splice(cardIdx, 1);
  }
}

// 导出全局单例
export const game = new Game();

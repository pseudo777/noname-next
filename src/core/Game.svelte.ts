// src/core/Game.svelte.ts
import { Player } from "./Player.svelte";
import type { CharacterDef } from "./types/api";
import { logger } from "./Logger.svelte";

// 简单的延时函数，让AI操作看起来像真人在思考
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class Game {
  // 玩家列表
  players = $state<Player[]>([]);

  // 当前操作的玩家索引
  currentTurnUid = $state("");

  // 谁是主视角（就是屏幕前的你）
  // $derived: 假设第一个玩家总是“我”
  me = $derived(this.players[0]);
  // 获取当前回合的玩家对象
  get currentTurnPlayer() {
    return this.players.find((p) => p.uid === this.currentTurnUid);
  }

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
    // 游戏开始，我先手
    this.currentTurnUid = p1.uid;

    logger.add("游戏开始！");
    this.startTurn(p1);
  }

  // --- 回合流程控制 ---

  async startTurn(player: Player) {
    logger.add(`\n--- 轮到 [${player.name}] 的回合 ---`);

    // 1. 摸牌阶段
    await sleep(500);
    player.drawCard();
    player.drawCard();
    logger.add(logger.player(player), " 摸了两张牌");

    // 2. 出牌阶段
    // 如果是电脑(不是我)，就自动行动
    if (player !== this.me) {
      await this.aiAct(player);
    }
  }

  async nextTurn() {
    // 找到下一个人
    const currentIdx = this.players.findIndex(
      (p) => p.uid === this.currentTurnUid
    );
    const nextIdx = (currentIdx + 1) % this.players.length;
    const nextPlayer = this.players[nextIdx];

    this.currentTurnUid = nextPlayer.uid;
    await this.startTurn(nextPlayer);
  }

  // --- 简单 AI 逻辑 ---

  async aiAct(ai: Player) {
    await sleep(1000); // 假装思考

    // 1. 找杀
    const killCard = ai.hand.find((c) => c.name === "杀");
    const target = this.me; // 目标永远是我

    if (killCard) {
      logger.add(
        logger.player(ai),
        " 对 ",
        logger.player(target),
        " 使用了 ",
        logger.card("杀")
      );

      // 简单的出牌动画感
      await sleep(500);
      target.damage(1);

      // 弃牌
      ai.hand = ai.hand.filter((c) => c.id !== killCard.id);
    } else {
      logger.add(logger.player(ai), " 微微一笑，没有出牌");
    }

    await sleep(1000);
    // AI 回合结束
    this.nextTurn();
  }

  /**
   * 核心逻辑：使用卡牌
   * @param cardId 使用的卡牌ID
   * @param targetId 目标的ID (如果是杀，必须有目标)
   */
  useCard(cardId: string, targetId?: string) {
    const user = this.currentTurnPlayer;
    if (!user) return;
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

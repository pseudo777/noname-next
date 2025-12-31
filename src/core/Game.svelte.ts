// src/core/Game.svelte.ts
import { Player } from "./Player.svelte";
import type { CharacterDef } from "./types/api";
import { logger } from "./Logger.svelte";

// 简单的延时函数，让AI操作看起来像真人在思考
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 定义一个交互请求的结构
interface CardRequest {
  playerId: string; // 谁需要操作
  cardName: string; // 需要出什么牌 (比如 "闪")
  resolve: (result: boolean) => void; // 也就是 Promise 的 resolve
}

export class Game {
  // 玩家列表
  players = $state<Player[]>([]);

  // 当前操作的玩家索引
  currentTurnUid = $state("");

  // 新增：当前的交互请求
  pendingRequest = $state<CardRequest | null>(null);

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
      // 这样 AI 也会触发 askForCard，从而激活你的 UI 响应窗口
      console.log("AI 决定出杀...");
      await this.useCard(killCard.id, target.uid);
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
  async useCard(cardId: string, targetId?: string) {
    const user = this.currentTurnPlayer;
    if (!user) return;

    // ... 找牌逻辑 ...
    const card = user.hand.find((c) => c.id === cardId);
    if (!card) return;

    // ... 找目标逻辑 ...
    let target: Player | undefined;
    if (targetId) target = this.players.find((p) => p.uid === targetId);

    // 弃牌 (先扣牌，再结算效果)
    user.hand = user.hand.filter((c) => c.id !== cardId);

    // --- 逻辑分支 ---
    if (card.name === "杀") {
      if (!target) return;

      logger.add(
        logger.player(user),
        " 对 ",
        logger.player(target),
        " 使用了 ",
        logger.card(card.name)
      );

      // 🌟 关键点：异步询问目标是否出闪 🌟
      // 只有当 askForCard 返回 false (没出闪) 时，才造成伤害
      const hasShan = await this.askForCard(target, "闪");

      if (hasShan) {
        logger.add(logger.card("杀"), " 被抵消了");
      } else {
        target.damage(1);
      }
    } else if (card.name === "桃") {
      // ... 桃的逻辑 ...
      user.health.recover(1);
      logger.add(logger.player(user), " 吃了一个 ", logger.card("桃"));
    }

    // 告诉 UI 刷新一下选中状态 (可选)
  }

  // --- 核心交互方法 ---

  /**
   * 询问某人打出一张牌
   * @param player 询问的对象
   * @param cardName 需要打出的牌名
   * @returns Promise<boolean> true=打出了, false=取消/没打
   */
  async askForCard(player: Player, cardName: string): Promise<boolean> {
    logger.add(`等待 [${player.name}] 打出 【${cardName}】...`);

    // 1. 如果是 AI，直接由 AI 决定 (目前简写为：有就出)
    if (player !== this.me) {
      await new Promise((r) => setTimeout(r, 1000)); // 假装思考
      const card = player.hand.find((c) => c.name === cardName);
      if (card) {
        // AI 出牌
        player.hand = player.hand.filter((c) => c.id !== card.id);
        logger.add(logger.player(player), " 打出了 ", logger.card(cardName));
        return true;
      } else {
        return false;
      }
    }

    // 2. 如果是玩家，挂起 Promise，等待 UI 响应
    return new Promise<boolean>((resolve) => {
      this.pendingRequest = {
        playerId: player.uid,
        cardName: cardName,
        // 这里封装一下 resolve，处理完后顺便清理状态
        resolve: (result) => {
          this.pendingRequest = null;
          resolve(result);
        },
      };
    });
  }

  /**
   * 玩家在 UI 上点击了响应
   * @param cardId 选中的卡牌ID (如果为空表示点击了取消)
   */
  respondCard(cardId?: string) {
    if (!this.pendingRequest) return;

    const player = this.me; // 肯定是玩家在操作

    if (cardId) {
      // 校验牌对不对
      const card = player.hand.find((c) => c.id === cardId);
      if (card && card.name === this.pendingRequest.cardName) {
        // 扣掉这张牌
        player.hand = player.hand.filter((c) => c.id !== cardId);
        logger.add(logger.player(player), " 打出了 ", logger.card(card.name));
        // 完成 Promise，返回 true
        this.pendingRequest.resolve(true);
        return;
      }
    }

    // 选择了取消，或卡牌不对
    logger.add(logger.player(player), " 选择不打出");
    this.pendingRequest.resolve(false);
  }
}

// 导出全局单例
export const game = new Game();

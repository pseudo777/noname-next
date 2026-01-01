import { Player } from "./Player.svelte";
import { logger } from "./Logger.svelte";
import { cardManager } from "./managers/CardManager";
import type { CardInstance } from "./api/CardInstance";
import type { CharacterDefinition } from "./types/core";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface CardRequest {
  playerId: string;
  cardName: string;
  resolve: (b: boolean) => void;
}

export class Game {
  players = $state<Player[]>([]);
  deck = $state<CardInstance[]>([]);
  discardPile: CardInstance[] = [];

  currentTurnUid = $state("");
  pendingRequest = $state<CardRequest | null>(null);
  winner = $state<string | null>(null);

  me = $derived(this.players[0]);
  get currentPlayer() {
    return this.players.find((p) => p.uid === this.currentTurnUid);
  }

  // 启动游戏
  start(p1Def: CharacterDefinition, p2Def: CharacterDefinition) {
    this.deck = cardManager.buildDeck();
    this.players = [new Player(p1Def), new Player(p2Def)];

    // 初始发牌
    this.players.forEach((p) => p.drawCard(4));
    logger.add("游戏开始");

    // 开启第一回合
    this.startTurn(this.players[0]);
  }

  // 从牌堆抽牌
  drawCardsFromDeck(n: number): CardInstance[] {
    const res: CardInstance[] = [];
    for (let i = 0; i < n; i++) {
      if (this.deck.length === 0) {
        if (this.discardPile.length === 0) break;
        // 简单的洗牌重置
        this.deck = [...this.discardPile].sort(() => Math.random() - 0.5);
        this.discardPile = [];
        logger.add("洗牌");
      }
      res.push(this.deck.pop()!);
    }
    return res;
  }

  // 开启回合
  async startTurn(player: Player) {
    this.currentTurnUid = player.uid;
    logger.add(`\n--- ${player.name} 回合 ---`);
    await sleep(500);

    // 摸牌阶段
    await player.drawCard(2);

    // 出牌阶段
    if (player !== this.me) {
      await this.aiAct(player);
    }
    // 如果是玩家自己，就停在这里，等待 UI 操作（出牌或点击结束回合）
  }

  // ✅ 修复：新增 nextTurn 方法供 UI 调用
  async nextTurn() {
    if (this.winner) return;

    const currentIdx = this.players.findIndex(
      (p) => p.uid === this.currentTurnUid
    );
    const nextIdx = (currentIdx + 1) % this.players.length;
    const nextPlayer = this.players[nextIdx];

    await this.startTurn(nextPlayer);
  }

  // AI 行动逻辑
  async aiAct(ai: Player) {
    await sleep(800);
    const kill = ai.hand.find((c) => c.name === "杀");

    if (kill) {
      // 简单 AI：有杀就打
      await this.useCard(kill.id, this.me.uid);
    } else {
      logger.add(logger.player(ai), " 结束了回合");
    }

    await sleep(500);
    this.nextTurn(); // AI 行动结束后自动切回合
  }

  // 使用卡牌
  async useCard(cardId: string, targetUid?: string) {
    const user = this.currentPlayer;
    if (!user) return;

    const card = user.hand.find((c) => c.id === cardId);
    if (!card) return;

    const targets = targetUid
      ? this.players.filter((p) => p.uid === targetUid)
      : [];

    if (!card.def.canUse(this, user, targets)) {
      logger.add("不可用");
      return;
    }

    // 扣除手牌
    user.hand = user.hand.filter((c) => c.id !== cardId);
    // 进入弃牌堆
    this.discardPile.push(card);
    // 执行逻辑
    await card.def.execute(this, user, targets);
  }

  // 请求打出卡牌（响应）
  async askForCard(p: Player, cardName: string): Promise<boolean> {
    if (p !== this.me) {
      // AI 简单响应
      await sleep(500);
      const c = p.hand.find((c) => c.name === cardName);
      if (c) {
        p.hand = p.hand.filter((x) => x.id !== c.id);
        this.discardPile.push(c);
        logger.add(logger.player(p), ` 打出了 ${cardName}`);
        return true;
      }
      return false;
    }
    // 玩家响应：挂起等待 UI
    return new Promise((resolve) => {
      this.pendingRequest = {
        playerId: p.uid,
        cardName,
        resolve: (b) => {
          this.pendingRequest = null;
          resolve(b);
        },
      };
    });
  }

  // 响应操作（UI 调用）
  respond(cardId?: string) {
    if (!this.pendingRequest) return;

    if (cardId) {
      const c = this.me.hand.find((x) => x.id === cardId);
      // 检查卡牌名是否匹配（这里用 name 也就是中文名匹配）
      if (c && c.name === this.pendingRequest.cardName) {
        this.me.hand = this.me.hand.filter((x) => x.id !== cardId);
        this.discardPile.push(c);
        this.pendingRequest.resolve(true);
        return;
      }
    }
    // 取消/不打出
    this.pendingRequest.resolve(false);
  }

  // 濒死处理
  async handleDying(p: Player): Promise<boolean> {
    logger.add(logger.player(p), " 进入濒死状态！");
    while (p.hp.current <= 0) {
      // 简化：只向濒死者自己求桃
      const saved = await this.askForCard(p, "桃");
      if (saved) {
        p.recover(1);
      } else {
        break; // 没桃了，死亡
      }
    }

    if (p.hp.current <= 0) {
      this.handleDeath(p);
      return false;
    }
    return true;
  }

  handleDeath(p: Player) {
    logger.add(logger.player(p), " 阵亡了");
    if (p === this.me) {
      this.winner = "AI";
    } else {
      this.winner = "You";
    }
  }
}

export const game = new Game();

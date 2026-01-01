// src/core/managers/CardManager.ts
import type { CardDefinition, CardConfig } from "../types/core";
import { CardInstance } from "../api/CardInstance";

class CardManager {
  private definitions = new Map<string, CardDefinition>();
  private deckConfigs: CardConfig[] = [];

  register(def: CardDefinition) {
    this.definitions.set(def.name, def);
  }

  addDeckConfig(cards: CardConfig[]) {
    this.deckConfigs.push(...cards);
  }

  getDefinition(name: string): CardDefinition {
    return (
      this.definitions.get(name) || {
        name: "unknown",
        displayName: "未知",
        type: "basic",
        canUse: () => false,
        execute: async () => {},
      }
    );
  }

  buildDeck(): CardInstance[] {
    const deck = this.deckConfigs.map(
      (cfg) => new CardInstance(cfg.suit, cfg.point, cfg.name)
    );
    // 洗牌
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
}
export const cardManager = new CardManager();

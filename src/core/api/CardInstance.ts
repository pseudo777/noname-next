// src/core/api/CardInstance.ts
import { cardManager } from "../managers/CardManager";
import type { Suit, CardDefinition } from "../types/core";

export class CardInstance {
  id: string = crypto.randomUUID();
  suit: Suit;
  point: number;
  definitionName: string;

  constructor(suit: Suit, point: number, name: string) {
    this.suit = suit;
    this.point = point;
    this.definitionName = name;
  }

  get def(): CardDefinition {
    return cardManager.getDefinition(this.definitionName);
  }

  // UI 兼容属性
  get name() {
    return this.def.displayName;
  }
  get type() {
    return this.def.type;
  }
  get description() {
    return this.def.description;
  }
  get isRed() {
    return this.suit === "heart" || this.suit === "diamond";
  }
  get isBlack() {
    return this.suit === "spade" || this.suit === "club";
  }
}

// src/core/packages/standard/index.ts
import type { GamePackage } from "../../types/core";
import { SHA, SHAN, TAO, WUZHONG } from "./cards/basic";
import { CAOCAO, JIANXIONG } from "./characters/wei";
import deckData from "./data/cards.json";

export const StandardPackage: GamePackage = {
  id: "standard",
  name: "标准版",
  cards: [SHA, SHAN, TAO, WUZHONG],
  deck: deckData as any,
  skills: [JIANXIONG],
  characters: [CAOCAO],
};

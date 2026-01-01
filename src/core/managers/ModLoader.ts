// src/core/managers/ModLoader.ts
import type { GamePackage } from "../types/core";
import { cardManager } from "./CardManager";
import { skillManager } from "./SkillManager";
import { characterManager } from "./CharacterManager";

export const modLoader = {
  load(pkg: GamePackage) {
    console.log(`📦 加载模组: ${pkg.name}`);

    if (pkg.cards) pkg.cards.forEach((d) => cardManager.register(d));
    if (pkg.deck) cardManager.addDeckConfig(pkg.deck);
    if (pkg.skills) pkg.skills.forEach((d) => skillManager.register(d));
    if (pkg.characters)
      pkg.characters.forEach((d) => characterManager.register(d));
  },
};

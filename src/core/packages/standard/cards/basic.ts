// src/core/packages/standard/cards/basic.ts
import type { CardDefinition } from "../../../types/core";
import { logger } from "../../../Logger.svelte";

export const SHA: CardDefinition = {
  name: "sha",
  displayName: "杀",
  type: "basic",
  description: "出牌阶段，对攻击范围内的一名角色使用。",
  canUse: (game, user, targets) => targets.length === 1 && targets[0] !== user,
  execute: async (game, user, targets) => {
    const target = targets[0];
    logger.add(
      logger.player(user),
      " 对 ",
      logger.player(target),
      " 使用了 ",
      logger.card("杀")
    );
    const hasShan = await game.askForCard(target, "闪");
    if (!hasShan) await target.damage(1);
    else logger.add(logger.card("杀"), " 被抵消");
  },
};

export const SHAN: CardDefinition = {
  name: "shan",
  displayName: "闪",
  type: "basic",
  canUse: () => false,
  execute: async () => {},
};

export const TAO: CardDefinition = {
  name: "tao",
  displayName: "桃",
  type: "basic",
  canUse: (game, user) => user.hp.current < user.hp.max,
  execute: async (game, user) => {
    user.recover(1);
  },
};

export const WUZHONG: CardDefinition = {
  name: "wuzhong",
  displayName: "无中生有",
  type: "scroll",
  canUse: () => true,
  execute: async (game, user) => {
    logger.add(logger.player(user), " 使用无中生有");
    await user.drawCard(2);
  },
};

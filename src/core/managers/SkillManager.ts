// src/core/managers/SkillManager.ts
import type { SkillDefinition } from "../types/core";

class SkillManager {
  private definitions = new Map<string, SkillDefinition>();

  register(def: SkillDefinition) {
    this.definitions.set(def.name, def);
  }

  get(name: string): SkillDefinition | undefined {
    return this.definitions.get(name);
  }
}
export const skillManager = new SkillManager();

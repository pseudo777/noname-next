// src/core/managers/CharacterManager.ts
import type { CharacterDefinition } from "../types/core";

class CharacterManager {
  private definitions = new Map<string, CharacterDefinition>();

  register(def: CharacterDefinition) {
    this.definitions.set(def.id, def);
  }

  get(id: string): CharacterDefinition | undefined {
    return this.definitions.get(id);
  }

  getAll(): CharacterDefinition[] {
    return Array.from(this.definitions.values());
  }
}
export const characterManager = new CharacterManager();

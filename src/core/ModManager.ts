// src/core/ModManager.ts
import type { CharacterDef, ModManifest, SkillDef } from "./types/api";

class ModManager {
  // 这里的 Map 就是数据库，存着所有注册进来的武将
  private characters = new Map<string, CharacterDef>();
  // 技能库
  private skills = new Map<string, SkillDef>();

  // 1. 注册扩展包
  register(mod: ModManifest) {
    console.log(
      `[Debug] 注册 Mod: ${mod.id}, 包含技能数: ${mod.skills?.length || 0}`
    );
    // 注册武将
    mod.characters.forEach((char) => this.characters.set(char.id, char));

    // 注册技能
    if (mod.skills) {
      mod.skills.forEach((skill) => this.skills.set(skill.id, skill));
    }
  }
  // 新增获取技能
  getSkill(id: string) {
    return this.skills.get(id);
  }

  // 获取武将数据
  getCharacter(id: string): CharacterDef | undefined {
    return this.characters.get(id);
  }

  // 获取所有已注册武将的列表 (为了UI显示用)
  getAllCharacters() {
    return Array.from(this.characters.values());
  }
}

// 导出单例，保证全局只有一个管理器
export const modManager = new ModManager();

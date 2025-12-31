<script lang="ts">
  import { Player } from '@core/Player.svelte';
  import { modManager } from '@core/ModManager';
  import { StandardPack } from '@mods/standard';
  
  // 1. 游戏启动时，注册 Mod
  // 在真实引擎中，这会在 main.ts 或 boot.ts 里执行
  modManager.register(StandardPack);

  // 2. 获取所有武将列表供选择
  const charList = modManager.getAllCharacters();

  // 3. 当前选中的武将 (初始为空)
  let currentPlayer = $state<Player | null>(null);

  // 选人逻辑
  function selectCharacter(id: string) {
    const def = modManager.getCharacter(id);
    if (def) {
      // 通过配置创建武将！
      currentPlayer = new Player(def);
    }
  }
</script>

<main>
  <h1>无名杀重构 - 选将测试</h1>

  {#if !currentPlayer}
    <div class="lobby">
      <h2>请选择一名武将:</h2>
      <div class="char-grid">
        {#each charList as char}
          <button onclick={() => selectCharacter(char.id)}>
            {char.name} ({char.country}) <br>
            <small>体力: {char.maxHp}</small>
          </button>
        {/each}
      </div>
    </div>
  
  {:else}
    <div class="arena">
      <button class="back-btn" onclick={() => currentPlayer = null}>← 返回选将</button>
      
      <div class="card">
        <h2>{currentPlayer.name} <small>[{currentPlayer.country}]</small></h2>
        
        <div class="status">
          <span class="hp" style:color={currentPlayer.health.current < 2 ? 'red' : 'green'}>
            体力: {currentPlayer.health.current} / {currentPlayer.health.max}
          </span>
        </div>

        <div class="skills-area">
            {#each currentPlayer.skills as skill}
                <div class="skill-tag" title={skill.description}>
                    {skill.name}
                </div>
            {/each}
        </div>

        <div class="hand-area">
          <div class="cards">
            {#each currentPlayer.hand as card}
              <button class="game-card">{card}</button>
            {/each}
          </div>
        </div>

        <div class="controls">
          <button onclick={() => currentPlayer?.damage(1)}>扣血</button>
          <button onclick={() => currentPlayer?.drawCard()}>摸牌</button>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  /* 简单样式 */
  .char-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-width: 400px; }
  .char-grid button { padding: 20px; font-size: 1.1em; cursor: pointer; }
  .back-btn { margin-bottom: 20px; }
  .hp { font-weight: bold; }
  .game-card { border: 1px solid #999; padding: 5px 10px; margin: 2px; }
  .skill-tag {
    background: linear-gradient(45deg, #FFD700, #FFA500);
    color: #333;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
    font-weight: bold;
    display: inline-block;
    margin-right: 5px;
    cursor: help;
    box-shadow: 1px 1px 3px rgba(0,0,0,0.2);
}
</style>
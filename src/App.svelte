<script lang="ts">
  import { Player } from '@core/Player.svelte';
  import { modManager } from '@core/ModManager';
  import { StandardPack } from '@mods/standard';
  import PlayerAvatar from './components/PlayerAvatar.svelte';
  import Card from './components/Card.svelte';
  import type { CardDef } from '@core/types/api';
  
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


  // --- 交互状态管理 ---
  // 使用 Set 存储被选中的卡牌 ID
  let selectedIds = $state(new Set<string>());

  // 切换选中状态
  function toggleCard(card: CardDef) {
    if (selectedIds.has(card.id)) {
      selectedIds.delete(card.id);
    } else {
      // 简单起见，这里先做单选模式 (如果想多选，就去掉这行 clear)
      selectedIds.clear(); 
      selectedIds.add(card.id);
    }
    // 触发 Set 的响应式更新 (Svelte 5 的 Set 需要重新赋值或使用特殊方法，这里简单用重新赋值触发)
    selectedIds = new Set(selectedIds);
  }

  // 模拟“出牌”逻辑
  function useCard() {
    if (selectedIds.size === 0) return;

    // 1. 找到被选中的牌
    const cardsToUse = currentPlayer!.hand.filter(c => selectedIds.has(c.id));
    const card = cardsToUse[0]; // 暂时只处理一张

    console.log(`[Game] 玩家使用了卡牌: ${card.name}`);

    // 2. 简单的卡牌效果模拟 (实际应该走 CardLogic 模块)
    if (card.name === '桃') {
        currentPlayer!.health.recover(1);
    } else if (card.name === '杀') {
        // 自杀测试 (模拟指向自己)
        currentPlayer!.damage(1);
    }

    // 3. 弃牌 (从手牌移除)
    // 利用 filter 生成新数组
    currentPlayer!.hand = currentPlayer!.hand.filter(c => c.id !== card.id);
    
    // 4. 清空选中
    selectedIds.clear();
    selectedIds = new Set(selectedIds);
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
        <div class="player-header">
            <PlayerAvatar player={currentPlayer} />
            
            <div class="info-column">
                <h2>{currentPlayer.name}</h2>
                <div class="status">
                    <span class="hp" style:color={currentPlayer.health.current < 2 ? 'red' : 'green'}>
                         {'❤'.repeat(currentPlayer.health.current)} 
                         <small>({currentPlayer.health.current}/{currentPlayer.health.max})</small>
                    </span>
                </div>
                <div class="skills-area">
                    {#each currentPlayer.skills as skill}
                        <div class="skill-tag" title={skill.description}>{skill.name}</div>
                    {/each}
                </div>
            </div>
        </div>

        <hr/>

        <div class="hand-area">
          <div class="cards-list">
            {#each currentPlayer.hand as card (card.id)}
              <Card 
                {card} 
                selected={selectedIds.has(card.id)}
                onclick={() => toggleCard(card)}
              />
            {/each}
          </div>
      </div>

      <div class="controls">
          <button onclick={() => currentPlayer?.drawCard()}>摸牌</button>
          
          <button 
            onclick={useCard} 
            disabled={selectedIds.size === 0}
            class="use-btn"
          >
            出牌 {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
          </button>
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
.player-header {
      display: flex;
      gap: 20px;
      margin-bottom: 10px;
  }
  .info-column {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
  }
  .hand-area {
      margin-top: 20px;
      min-height: 140px;
      padding: 10px;
      background: #e0e0e0;
      border-radius: 8px;
      overflow-x: auto; /* 手牌多了可以滚动 */
  }
  .cards-list {
      display: flex;
      gap: -20px; /* 让牌稍微叠在一起，像真的一样 */
      padding-top: 20px; /* 给浮动留空间 */
  }
  /* 为了让鼠标悬停时容易选中，可以给卡牌加个 hover 展开效果 */
  .cards-list:hover {
      gap: 5px;
  }
  
  .use-btn {
      background: #D03B31;
      color: white;
      font-weight: bold;
      padding: 10px 30px;
      font-size: 1.1em;
  }
  .use-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
  }
</style>
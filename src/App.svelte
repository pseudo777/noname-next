<script lang="ts">
  import { game } from '@core/Game.svelte';
  import { modManager } from '@core/ModManager';
  import { StandardPack } from '@mods/standard';
  import PlayerAvatar from './components/PlayerAvatar.svelte';
  import Card from './components/Card.svelte';
  import GameLog from './components/GameLog.svelte';
  import type { CardDef } from '@core/types/api';

  // 初始化 Mod
  modManager.register(StandardPack);
  const charList = modManager.getAllCharacters();

  // --- 状态管理 ---
  let isSelectingChar = $state(true); // 是否在选将界面
  let selectedIds = $state(new Set<string>()); // 选中的手牌

  // 新增：是否处于“选择目标”状态
  let isTargetingMode = $state(false);

  // 选将开始游戏
  function startGame(myCharId: string) {
      const myDef = modManager.getCharacter(myCharId);
      // 随便给安排一个敌人 (吕布)
      const enemyDef = modManager.getCharacter("lvbu") || charList[0];
      
      if (myDef && enemyDef) {
          game.start(myDef, enemyDef);
          isSelectingChar = false;
      }
  }

  let isMyTurn = $derived(game.currentTurnUid === game.me.uid);

  // 点击“出牌”按钮
  function handleUseCardBtn() {
      if (selectedIds.size === 0) return;
      
      const cardId = Array.from(selectedIds)[0];
      const card = game.me.hand.find(c => c.id === cardId);
      
      if (!card) return;

      // 如果是【杀】，进入目标选择模式
      if (card.name === '杀') {
          isTargetingMode = true; // <--- 开启选择模式
          console.log("请选择目标...");
      } else {
          // 其他牌直接用
          game.useCard(card.id);
          selectedIds.clear();
          selectedIds = new Set(selectedIds); // 触发更新
      }
  }

  // 点击某个玩家头像 (作为目标)
  function handlePlayerClick(targetUid: string) {
      // 只有在选择模式下，点击头像才有效
      if (isTargetingMode) {
          const cardId = Array.from(selectedIds)[0];
          
          // 执行出牌逻辑
          game.useCard(cardId, targetUid);
          
          // 重置状态
          isTargetingMode = false;
          selectedIds.clear();
          selectedIds = new Set(selectedIds);
      }
  }

  // 取消选择
  function cancelTargeting() {
      isTargetingMode = false;
  }

  
</script>

<main>
  {#if isSelectingChar}
    <div class="lobby">
        <h2>请选择你的武将:</h2>
        <div class="char-grid">
          {#each charList as char}
            <button onclick={() => startGame(char.id)}>{char.name}</button>
          {/each}
        </div>
    </div>
  {:else}
    <div class="battle-container">
        <div class="arena">
          <div class="turn-indicator" class:my-turn={isMyTurn}>
            {#if isMyTurn}
                🟢 你的回合
            {:else}
                🔴 敌方行动中...
            {/if}
        </div>
            <div class="enemies-row">
                {#each game.players.filter(p => p !== game.me) as enemy}
                    <div 
                        class="enemy-slot" 
                        class:valid-target={isTargetingMode}
                        onclick={() => handlePlayerClick(enemy.uid)}
                        role="button"
                        tabindex="0"
                    >
                        <PlayerAvatar player={enemy} />
                        <div class="card-count">🎴 {enemy.hand.length}</div>
                    </div>
                {/each}
            </div>

            <div class="middle-zone">
                {#if isTargetingMode}
                    <div class="guide-text">请选择一名目标...</div>
                    <button class="cancel-btn" onclick={cancelTargeting}>取消</button>
                {/if}
            </div>

            <div class="my-zone" class:active={isMyTurn}>
                <div class="player-header">
                    <div onclick={() => handlePlayerClick(game.me.uid)} role="button" tabindex="0">
                        <PlayerAvatar player={game.me} />
                    </div>
                    
                    <div class="status-box">
                         <h2>{game.me.name}</h2>
                         <div class="hp">❤ {game.me.health.current}</div>
                    </div>
                </div>

                <div class="hand-area">
                    <div class="cards-list">
                      {#each game.me.hand as card (card.id)}
                        <Card 
                          {card} 
                          selected={selectedIds.has(card.id)}
                          onclick={() => {
                              // 选牌逻辑 (同之前)
                              if (selectedIds.has(card.id)) selectedIds.delete(card.id);
                              else { selectedIds.clear(); selectedIds.add(card.id); }
                              selectedIds = new Set(selectedIds);
                          }}
                        />
                      {/each}
                    </div>
                </div>

                <div class="controls">
                <button 
                    class="use-btn"
                    disabled={!isMyTurn || selectedIds.size === 0} 
                    onclick={handleUseCardBtn}
                >
                    {isTargetingMode ? '选择目标...' : '出牌'}
                </button>

                <button 
                    class="end-btn"
                    disabled={!isMyTurn}
                    onclick={() => game.nextTurn()}
                >
                    结束回合
                </button>
             </div>
            </div>
        </div>

        <div class="sidebar">
            <GameLog />
        </div>
    </div>
  {/if}
</main>

<style>
    /* ... 基础布局同上一次 ... */
    .battle-container { display: flex; height: 100vh; max-width: 1200px; margin: 0 auto; gap: 20px;}
    .arena { flex: 3; display: flex; flex-direction: column; justify-content: space-between; padding: 20px; }
    .sidebar { flex: 1; background: #222; margin: 20px 0; border-radius: 8px; }

    /* 敌人区域 */
    .enemies-row { display: flex; justify-content: center; gap: 20px; height: 180px; }
    
    .enemy-slot { 
        position: relative; transition: transform 0.2s; border-radius: 8px;
    }
    /* 目标选择模式下的高亮 */
    .enemy-slot.valid-target {
        cursor: crosshair;
        box-shadow: 0 0 15px #ff4d4d;
        transform: scale(1.05);
        animation: pulse 1s infinite;
    }

    .card-count {
        position: absolute; right: -10px; bottom: 10px;
        background: #333; color: white; padding: 2px 8px; border-radius: 10px;
        font-size: 0.8em;
    }

    .middle-zone { 
        flex: 1; display: flex; flex-direction: column; 
        align-items: center; justify-content: center; 
    }
    .guide-text { font-size: 1.5em; font-weight: bold; color: #ff4d4d; margin-bottom: 10px; text-shadow: 0 0 5px black;}

    .my-zone { background: rgba(0,0,0,0.05); padding: 10px; border-radius: 12px; }
    .player-header { display: flex; gap: 15px; margin-bottom: 10px; }
    .hp { color: green; font-weight: bold; font-size: 1.2em; }
    
    .cancel-btn { background: #666; color: white; }

    @keyframes pulse {
        0% { box-shadow: 0 0 10px #ff4d4d; }
        50% { box-shadow: 0 0 25px #ff0000; }
        100% { box-shadow: 0 0 10px #ff4d4d; }
    }
    
    /* 简单的选将样式 */
    .lobby { text-align: center; padding-top: 50px; }
    .char-grid button { font-size: 1.2em; padding: 15px 30px; margin: 10px; cursor: pointer; }
    .cards-list {
    display: flex;
    flex-direction: row; /* 强制横向排列 */
    flex-wrap: nowrap;   /* 禁止换行 (手牌多了就出现滚动条) */
    align-items: center; /* 垂直居中 */
    gap: -30px;          /* 让牌叠在一起，负值越大叠得越紧 */
    padding: 10px 20px;  /* 给上面留点浮动空间 */
}

/* 顺便优化一下外层容器，确保能滚动 */
.hand-area {
    width: 100%;
    overflow-x: auto; /* 允许横向滚动 */
    overflow-y: hidden;
    min-height: 150px;
    background: rgba(0,0,0,0.1); /* 给个背景色方便调试 */
    border-radius: 8px;
}
.turn-indicator {
        text-align: center;
        padding: 5px;
        background: #333;
        color: #fff;
        border-radius: 4px;
        margin-bottom: 10px;
        font-weight: bold;
    }
    .turn-indicator.my-turn { background: #4DB873; } /* 绿色 */

    /* 我的区域激活状态 */
    .my-zone { transition: box-shadow 0.3s; }
    .my-zone.active { box-shadow: 0 0 15px rgba(77, 184, 115, 0.3); border: 1px solid #4DB873; }

    .end-btn {
        background: #333;
        color: white;
        margin-left: auto; /* 把按钮推到最右边 */
    }
    .end-btn:hover { background: #555; }
    .end-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  
  // --- 核心引入 ---
  import { game } from "@core/Game.svelte";
  import { modLoader } from "@core/managers/ModLoader";
  import { characterManager } from "@core/managers/CharacterManager";
  import { StandardPackage } from "@core/packages/standard";

  // --- 组件引入 ---
  import PlayerAvatar from "./components/PlayerAvatar.svelte";
  import Card from "./components/Card.svelte";
  import GameLog from "./components/GameLog.svelte";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";

  // 1. 初始化：加载标准包
  // 这一步会注册所有卡牌、技能和武将
  modLoader.load(StandardPackage);

  // 获取所有可用武将（用于选人界面）
  const charList = characterManager.getAll();

  // 状态管理
  let isSelectingChar = $state(true);
  let selectedCharId = $state<string | null>(null);

  // 开始游戏逻辑
  function startGame() {
    if (!selectedCharId) return;

    // 获取玩家选择的武将定义
    const myCharDef = characterManager.get(selectedCharId);
    // 暂时写死敌人为曹操（确保你的 standard 包里有 id 为 'caocao' 的武将）
    // 如果没有 'caocao'，请改为 charList[0].id 或者其他存在的 ID
    const enemyCharDef = characterManager.get("caocao") || charList[0]; 

    if (myCharDef && enemyCharDef) {
      game.start(myCharDef, enemyCharDef);
      isSelectingChar = false;
    } else {
      console.error("无法找到武将定义");
    }
  }

  // 卡牌点击处理
  function handleCardClick(cardId: string) {
    if (game.pendingRequest) {
      // 响应阶段（比如被杀，需要出闪）
      game.respond(cardId);
    } else {
      // 出牌阶段（默认目标是敌人）
      // 注意：这里简单取 players[1] 作为敌人，实际逻辑可能更复杂
      const target = game.players.find((p) => p !== game.me);
      game.useCard(cardId, target?.uid);
    }
  }
</script>

<main class="h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden flex flex-col font-sans select-none">
  {#if isSelectingChar}
    <div class="flex flex-col items-center justify-center h-full gap-8 bg-[url('/bg.jpg')] bg-cover bg-center">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div class="relative z-10 flex flex-col items-center gap-8 animate-in zoom-in duration-500">
        <h1 class="text-6xl font-black tracking-widest text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-red-600 drop-shadow-lg">
          NONAME NEXT
        </h1>
        
        <div class="grid grid-cols-4 gap-4 p-4">
          {#each charList as char}
            <button
              class={cn(
                "w-32 h-40 border-2 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-2 hover:scale-105 active:scale-95",
                selectedCharId === char.id
                  ? "border-yellow-500 bg-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.5)]"
                  : "border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-slate-500"
              )}
              onclick={() => (selectedCharId = char.id)}
            >
              <span class="text-3xl font-bold text-slate-200">{char.name[0]}</span>
              <div class="text-sm font-bold">{char.name}</div>
              <div class="text-[10px] uppercase text-slate-400">{char.kingdom}</div>
            </button>
          {/each}
        </div>

        <Button
          size="lg"
          disabled={!selectedCharId}
          onclick={startGame}
          class="px-12 py-6 text-xl font-bold bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          开始征战
        </Button>
      </div>
    </div>
  {:else}
    <div class="relative flex-1 bg-[url('/bg.jpg')] bg-cover bg-center overflow-hidden">
      <div class="absolute inset-0 bg-slate-900/30"></div>

      <div class="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        {#if game.players[1]}
          <PlayerAvatar player={game.players[1]} isMe={false} />
        {/if}
      </div>

      <GameLog />

      <div class="absolute bottom-0 w-full h-1/3 bg-linear-to-t from-black/90 via-black/50 to-transparent flex items-end justify-between px-12 pb-6 z-20">
        
        <div class="mb-4">
          <PlayerAvatar player={game.me} isMe={true} />
        </div>

        <div class="flex-1 flex justify-center h-48 items-end -space-x-4 mx-8 pb-2 perspective-1000">
          {#each game.me.hand as card (card.id)}
            <div 
                animate:flip={{duration: 300}}
                in:fly={{y: 100, duration: 300}}
                class="transition-all duration-200 hover:-translate-y-8 hover:z-50 hover:scale-110 z-0"
            >
                <Card 
                  {card} 
                  onclick={() => handleCardClick(card.id)}
                  className={cn(
                    // 如果在响应阶段，且这张牌符合要求（比如求闪时手里的闪），高亮显示
                    game.pendingRequest && card.name === game.pendingRequest.cardName
                        ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-black cursor-pointer"
                        : "",
                    // 如果不可用，稍微变暗 (这里简单处理，实际可用 canUse 判断)
                    !game.pendingRequest && game.currentTurnUid !== game.me.uid
                        ? "brightness-75" 
                        : "brightness-100"
                  )}
                />
            </div>
          {/each}
        </div>

        <div class="mb-8 flex flex-col gap-3 min-w-30">
          {#if game.pendingRequest}
            <div class="flex flex-col gap-2 animate-in slide-in-from-bottom-4">
              <div class="text-yellow-400 font-black text-lg text-center drop-shadow-md animate-pulse">
                请打出 {game.pendingRequest.cardName}
              </div>
              <Button 
                variant="secondary" 
                class="w-full font-bold shadow-lg border border-slate-600"
                onclick={() => game.respond()}
              >
                取消 / 跳过
              </Button>
            </div>
          {:else if game.currentTurnUid === game.me.uid}
             <Button 
                variant="destructive" 
                class="w-full font-bold shadow-lg border border-red-800 hover:bg-red-600"
                onclick={() => game.nextTurn()} 
             >
                结束回合
             </Button>
          {/if}
        </div>
      </div>

      {#if game.winner}
        <div class="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-500">
          <div class="text-center p-12 rounded-2xl bg-slate-900 border-4 border-yellow-600 shadow-[0_0_50px_rgba(234,179,8,0.3)] transform scale-100">
            <h2 class="text-8xl font-black text-transparent bg-clip-text bg-linear-to-b from-yellow-300 to-yellow-600 mb-8 drop-shadow-lg">
              {game.winner === 'You' ? 'VICTORY' : 'DEFEAT'}
            </h2>
            <div class="text-2xl text-slate-400 mb-8 font-serif">
              {game.winner === 'You' ? '天下一统，万世永昌' : '胜败乃兵家常事'}
            </div>
            <Button 
                size="lg" 
                class="bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-8 text-xl"
                onclick={() => location.reload()}
            >
              再来一局
            </Button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</main>

<style>
  .perspective-1000 {
    perspective: 1000px;
  }
</style>
<script lang="ts">
    import { fly } from 'svelte/transition';
    import { flip } from 'svelte/animate';
  	import { game } from '@core/Game.svelte';
	import { modManager } from '@core/ModManager';
	import { StandardPack } from '@mods/standard';
	import PlayerAvatar from './components/PlayerAvatar.svelte';
	import Card from './components/Card.svelte';
	import GameLog from './components/GameLog.svelte';
	import type { CardDef } from '@core/types/api';
    import { Button } from "$lib/components/ui/button";
    import { cn } from "$lib/utils";
  
  // ... 逻辑保持不变 ...
  // 初始化 Mod
	modManager.register(StandardPack);

	const charList = modManager.getAllCharacters();

	// --- 状态管理 ---
	let isSelectingChar = $state(true); // 是否在选将界面

	let selectedIds = $state(new Set<string>()); // 选中的手牌

	// 新增：是否处于“选择目标”状态
	let isTargetingMode = $state(false);

	// 判断当前是否是“询问状态”
	let isAsking = $derived(!!game.pendingRequest);

	// 询问的文字提示
	let askingText = $derived(isAsking ? `请打出一张【${game.pendingRequest?.cardName}】以响应` : '');

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
	async function handleUseCardBtn() {
		// 如果正在被询问，禁止主动出牌
		if (isAsking) return;

		if (selectedIds.size === 0) return;

		const cardId = Array.from(selectedIds)[0];
		const card = game.me.hand.find((c) => c.id === cardId);

		if (card?.name === '杀') {
			isTargetingMode = true;
		} else {
			// 注意：useCard 现在是 async 的，如果你不在意返回值，可以不加 await
			await game.useCard(cardId);

			selectedIds.clear();
			selectedIds = new Set(selectedIds);
		}
	}

	// --- 新增：处理响应阶段的手牌点击 ---
	function handleCardClick(card: CardDef) {
		// 1. 如果是“响应模式” (比如正在求闪)
		if (isAsking) {
			// 只有选对了牌才触发
			if (card.name === game.pendingRequest?.cardName) {
				game.respondCard(card.id);
			} else {
				// 选错了可以提示一下，或者不做反应
				console.log("这张牌无法响应");
			}

			return;
		}

		// 2. 否则是“正常选牌模式” (原有逻辑)
		if (selectedIds.has(card.id)) selectedIds.delete(card.id); else {
			selectedIds.clear();
			selectedIds.add(card.id);
		}

		selectedIds = new Set(selectedIds);
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

	let winner = $derived(game.winner);

	function restart() {
		window.location.reload(); // 最简单的重开：刷新页面
	}
</script>

<main class="min-h-screen bg-slate-100 p-4 font-sans text-slate-900">
  {#if isSelectingChar}
    <div class="flex flex-col items-center justify-center min-h-[80vh] gap-8">
        <h2 class="text-3xl font-bold tracking-tight">请选择你的武将</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          {#each charList as char}
            <Button 
                variant="outline" 
                class="h-24 w-40 text-lg hover:border-primary hover:bg-slate-50"
                onclick={() => startGame(char.id)}
            >
                {char.name}
            </Button>
          {/each}
        </div>
    </div>
  {:else}
    <div class="max-w-6xl mx-auto flex gap-6 h-[90vh]">
        
        <div class="flex-1 flex flex-col justify-between rounded-xl border bg-white shadow-sm p-6 relative">
            
            <div class={cn(
                "absolute top-0 inset-x-0 py-1 text-center text-sm font-medium transition-colors rounded-t-xl",
                isMyTurn ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}>
                {isMyTurn ? "🟢 你的回合" : "🔴 敌方行动中..."}
            </div>

            <div class="flex justify-center gap-8 mt-6">
                {#each game.players.filter(p => p !== game.me) as enemy}
                    <div 
                        class={cn(
                            "relative group transition-all duration-300 rounded-lg p-2 border border-transparent",
                            isTargetingMode && "cursor-crosshair hover:bg-red-50 hover:border-red-500 hover:scale-105"
                        )}
                        onclick={() => handlePlayerClick(enemy.uid)}
                        role="button"
                        tabindex="0"
                    >
                        <PlayerAvatar player={enemy} />
                        <div class="absolute -right-2 -bottom-2 bg-slate-800 text-white text-xs px-2 py-0.5 rounded-full shadow border border-white">
                            🎴 {enemy.hand.length}
                        </div>
                    </div>
                {/each}
            </div>

            <div class="flex-1 flex items-center justify-center">
                {#if isTargetingMode}
                    <div class="animate-bounce text-red-600 font-bold text-2xl drop-shadow-sm">
                        请选择目标...
                    </div>
                {:else if isAsking}
                    <div class="text-amber-500 font-bold text-2xl animate-pulse">
                        {askingText}
                    </div>
                {/if}
            </div>

            <div class={cn(
                "bg-slate-50/50 rounded-xl p-4 border transition-all duration-500",
                isMyTurn ? "border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.2)]" : "border-slate-200",
                isAsking && "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            )}>
                <div class="flex items-center gap-4 mb-4">
                    <PlayerAvatar player={game.me} />
                    <div>
                        <div class="font-bold text-lg">{game.me.name}</div>
                        <div class="text-green-600 font-mono font-bold">
                            ❤ {game.me.health.current}/{game.me.health.max}
                        </div>
                    </div>
                    
                    <div class="ml-auto flex gap-2">
                        {#if isAsking}
                            <Button variant="secondary" onclick={() => game.respondCard(undefined)}>
                                取消 / 不出
                            </Button>
                        {:else}
                            <Button 
                                variant="default" 
                                disabled={!isMyTurn || selectedIds.size === 0} 
                                onclick={handleUseCardBtn}
                            >
                                {isTargetingMode ? '取消选择' : '出牌'}
                            </Button>
                            
                            <Button 
                                variant="destructive" 
                                disabled={!isMyTurn}
                                onclick={() => game.nextTurn()}
                            >
                                结束回合
                            </Button>
                        {/if}
                    </div>
                </div>

                <div class="flex gap-[-20px] overflow-x-auto pb-4 pt-6 px-2 min-h-[160px]">
                    <div class="flex -space-x-8 hover:space-x-1 transition-all duration-300 px-4">
                        {#each game.me.hand as card (card.id)}
                        <div                             
                            animate:flip={{ duration: 300 }}                           
                            
                            in:fly={{ y: 50, duration: 300 }} 
                            out:fly={{ y: -50, duration: 200 }}

                            class="transition-transform hover:z-10 hover:-translate-y-4"
                        >
                            <Card 
                                {card} 
                                selected={selectedIds.has(card.id)}
                                onclick={() => handleCardClick(card)} 
                            />
                        </div>
                            
                        {/each}
                    </div>
                </div>
            </div>
        </div>

        <div class="w-64 bg-slate-900 rounded-xl shadow-lg overflow-hidden flex flex-col">
            <div class="p-3 bg-slate-800 text-slate-200 text-sm font-bold border-b border-slate-700">
                战局日志
            </div>
            <div class="flex-1 overflow-hidden p-2">
                <GameLog />
            </div>
        </div>
    </div>
  {/if}
</main>
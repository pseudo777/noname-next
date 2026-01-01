<script lang="ts">
  import type { Player } from "@core/Player.svelte";
  import { game } from "@core/Game.svelte";
  import { cn } from "$lib/utils";
  import { Badge } from "$lib/components/ui/badge";
  import { Card } from "$lib/components/ui/card";

  let { player, isMe = false } = $props<{ 
    player: Player; 
    isMe?: boolean 
  }>();

  // 势力颜色映射
  const kingdomStyles: Record<string, string> = {
    wei: "bg-blue-600 hover:bg-blue-700 border-blue-800",
    shu: "bg-red-600 hover:bg-red-700 border-red-800",
    wu: "bg-green-600 hover:bg-green-700 border-green-800",
    qun: "bg-slate-500 hover:bg-slate-600 border-slate-700",
    god: "bg-yellow-500 hover:bg-yellow-600 border-yellow-700"
  };

  let isCurrent = $derived(game.currentTurnUid === player.uid);
  let isDying = $derived(player.hp.current <= 0);

  // 简单的血条颜色逻辑
  let hpColor = $derived.by(() => {
    const ratio = player.hp.current / player.hp.max;
    if (ratio <= 0.25) return "bg-red-500";
    if (ratio <= 0.5) return "bg-yellow-500";
    return "bg-green-500";
  });
</script>

<div class={cn(
    "relative flex flex-col items-center w-32 transition-all duration-300",
    isCurrent ? "scale-105 z-20" : "opacity-90 z-10",
    isDying && "animate-pulse grayscale"
)}>
    <Card class={cn(
        "w-32 h-32 overflow-hidden border-4 shadow-xl bg-slate-800 relative",
        isCurrent ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900 border-transparent" : "border-slate-700"
    )}>
        <div class="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-700 to-slate-900">
            <span class="text-5xl font-bold text-slate-500/30 select-none">
                {player.name[0]}
            </span>
        </div>

        <div class="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-sm p-1.5 flex flex-col items-center border-t border-white/10">
            <span class="text-white text-sm font-bold tracking-widest shadow-black drop-shadow-md">
                {player.name}
            </span>
        </div>

        <Badge class={cn("absolute top-1 left-1 px-1.5 py-0 text-[10px] uppercase shadow-md", kingdomStyles[player.country])}>
            {player.country}
        </Badge>
        
        <Badge variant="outline" class="absolute top-1 right-1 bg-black/60 text-white border-white/20 px-1.5 py-0 font-mono text-xs backdrop-blur-sm">
            🎴 {player.hand.length}
        </Badge>
    </Card>

    <div class="w-full mt-3 px-1 space-y-1">
        <div class="flex justify-center gap-1 h-3 mb-1">
             {#each Array(player.hp.max) as _, i}
                <div class={cn(
                    "w-3 h-3 rounded-full border border-black/50 shadow-sm transition-all duration-300",
                    i < player.hp.current ? hpColor : "bg-slate-700"
                )}></div>
             {/each}
        </div>
        
        <div class="flex justify-between items-center text-[10px] text-slate-400 font-mono px-1">
            <span>HP</span>
            <span>{player.hp.current}/{player.hp.max}</span>
        </div>
    </div>
</div>
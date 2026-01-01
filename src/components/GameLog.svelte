<script lang="ts">
  import { logger } from "@core/Logger.svelte";
  import { cn } from "$lib/utils";
  import { Card, CardHeader, CardTitle } from "$lib/components/ui/card"; // 注意：CardContent 没用到可以去掉，或者保留备用
  import { Badge } from "$lib/components/ui/badge";
  // ❌ 删除这一行：import { afterUpdate } from "svelte"; 

  let scrollRef = $state<HTMLDivElement>(); // 使用 $state 也可以，或者普通的 let scrollRef: HTMLDivElement 配合 bind:this

  // 自动滚动逻辑
  // $effect 会在组件挂载和依赖变化导致 DOM 更新后运行
  $effect(() => {
    // 追踪依赖：访问 logs.length 确保每次日志更新都触发
    logger.logs.length;
    
    // 执行滚动
    if (scrollRef) {
      scrollRef.scrollTop = scrollRef.scrollHeight;
    }
  });
</script>

<Card class="absolute top-4 right-4 w-72 h-112.5 bg-black/60 border-slate-700/50 backdrop-blur-md shadow-2xl flex flex-col z-30 pointer-events-none">
    <CardHeader class="p-3 border-b border-white/10 bg-black/20">
        <CardTitle class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Battle Log
        </CardTitle>
    </CardHeader>
    
    <div 
        bind:this={scrollRef}
        class="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pointer-events-auto"
    >
        {#each logger.logs as log (log.id)}
            <div class="text-sm text-slate-300 leading-relaxed font-sans animate-in slide-in-from-right-4 duration-300 fade-in">
                <span class="text-[10px] text-slate-600 font-mono mr-1 select-none">
                    {new Date(log.timestamp).toLocaleTimeString([], {hour12: false, minute:'2-digit', second:'2-digit'})}
                </span>
                
                {#each log.segments as seg}
                    {#if typeof seg === 'string'}
                        <span>{seg}</span>
                    {:else if seg.type === 'player'}
                        <span class={cn(
                            "font-bold hover:underline cursor-pointer transition-colors",
                            seg.isMe ? "text-green-400" : "text-yellow-400"
                        )}>
                            {seg.name}
                        </span>
                    {:else if seg.type === 'card'}
                        <Badge variant="secondary" class="mx-0.5 px-1 py-0 h-5 text-xs bg-slate-700 text-slate-200 hover:bg-slate-600 border-slate-600">
                            {seg.name}
                        </Badge>
                    {:else if seg.type === 'damage'}
                        <span class="font-bold text-red-500 mx-1">-{seg.amount}</span>
                    {:else if seg.type === 'recover'}
                        <span class="font-bold text-green-500 mx-1">+{seg.amount}</span>
                    {/if}
                {/each}
            </div>
        {/each}
        
        <div class="h-2"></div>
    </div>
</Card>
<script lang="ts">
  import type { CardInstance } from "@core/api/CardInstance";
  import { cn } from "$lib/utils";
  import { Card as UiCard, CardContent } from "$lib/components/ui/card";

  let { card, className, onclick } = $props<{ 
    card: CardInstance;
    className?: string;
    onclick?: () => void;
  }>();

  // 映射表
  const suitMap: Record<string, string> = {
    spade: "♠", heart: "♥", club: "♣", diamond: "♦", none: ""
  };
  const pointMap: Record<number, string> = {
    1: "A", 11: "J", 12: "Q", 13: "K"
  };

  let isRed = $derived(card.isRed);
  // 颜色逻辑：红色牌用红色，黑色牌用深灰色
  let textColor = $derived(isRed ? "text-red-600" : "text-slate-900");
  
  let bgClass = $derived.by(() => {
    switch (card.type) {
      case 'basic': return "bg-slate-50 hover:bg-white";
      case 'scroll': return "bg-amber-50 hover:bg-amber-100";
      case 'equip': return "bg-sky-50 hover:bg-sky-100";
      default: return "bg-white";
    }
  });

  let displayPoint = $derived(pointMap[card.point] || card.point.toString());

  function handleKeydown(e: KeyboardEvent) {
    if (onclick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onclick();
    }
  }
</script>

<div 
    class="group relative transition-transform hover:-translate-y-4 duration-200 outline-none" 
    role="button"
    tabindex="0"
    {onclick}
    onkeydown={handleKeydown}
>
    <UiCard class={cn(
        "w-24 h-36 border-2 select-none cursor-pointer overflow-hidden transition-colors relative p-0",
        isRed ? "border-red-200" : "border-slate-300",
        bgClass,
        className
    )}>
        <CardContent class="p-0 w-full h-full relative">
            
            <div class={cn(
                "absolute top-1 left-1 flex flex-col items-center leading-none text-lg font-black font-mono w-6 z-20", 
                textColor
            )}>
                <span>{displayPoint}</span>
                <span class="text-xl -mt-1">{suitMap[card.suit]}</span>
            </div>

            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span class={cn(
                    "text-2xl font-bold font-serif writing-vertical-rl tracking-widest",
                    textColor // 使用动态颜色
                )}>
                    {card.name}
                </span>
            </div>

            <div class="absolute bottom-1 w-full text-[10px] text-center text-slate-400 font-mono uppercase tracking-tighter">
                {card.type}
            </div>
        </CardContent>

        <div class={cn(
            "absolute -bottom-6 -right-6 text-8xl opacity-[0.08] pointer-events-none select-none font-serif",
            textColor
        )}>
            {suitMap[card.suit]}
        </div>
    </UiCard>
</div>

<style>
    .writing-vertical-rl {
        writing-mode: vertical-rl;
        text-orientation: upright;
    }
</style>
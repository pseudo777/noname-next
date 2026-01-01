<script lang="ts">
    import type { CardDef, Suit} from '@core/types/api';
    import { cn } from "$lib/utils";


    interface Props {
        card: CardDef;
        selected?: boolean;
        onclick?: () => void;
    }

    // 接收参数
    let { card, selected = false, onclick }: Props = $props();

    // 计算属性：点数和花色
    let pointStr = $derived(card.point > 10 
        ? {11:'J', 12:'Q', 13:'K'}[card.point] 
        : (card.point === 1 ? 'A' : card.point.toString())
    );

    // 辅助函数：根据花色决定颜色
    let isRed = $derived(card.suit === 'heart' || card.suit === 'diamond');

    // 定义一个类型明确的映射表
    // Record<Suit, string> 意思是：Key 必须是 Suit 类型，Value 是 string
    const suitMap: Record<Suit, string> = {
        spade: '♠', 
        heart: '♥', 
        club: '♣', 
        diamond: '♦'
    };

    // 使用映射表
    const suitSymbol = $derived(suitMap[card.suit as Suit]);
    
    // 同样的逻辑处理点数
    // const pointMap: Record<number, string> = {
    //     1: 'A', 11: 'J', 12: 'Q', 13: 'K'
    // };
    // 如果 card.point 不在 map 里（比如 2-10），回退显示原数字
    // const pointStr = $derived(pointMap[card.point] || card.point.toString());


    // 新增：键盘处理函数
    // function handleKeydown(e: KeyboardEvent) {
    //     // 如果按下回车或空格，也触发点击逻辑
    //     if (e.key === 'Enter' || e.key === ' ') {
    //         e.preventDefault(); // 防止空格键导致页面滚动
    //         onclick();
    //     }
    // }



</script>    
 <div 
    class={cn(
        "w-24 h-36 border rounded-lg shadow-sm relative flex items-center justify-center cursor-pointer transition-all duration-200 select-none bg-white",
        // 基础文字颜色
        isRed ? "text-red-600" : "text-slate-950",
        // 选中状态：上浮更多，加粗边框，加阴影
        selected && "border-blue-500 ring-2 ring-blue-200 -translate-y-6 shadow-xl z-10"
    )}
    onclick={onclick}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Enter' && onclick?.()}
>
    <div class="absolute top-1 left-2 flex flex-col items-center leading-none">
        <span class="text-lg font-bold font-serif">{pointStr}</span>
        <span class="text-sm">{card.suit}</span>
    </div>

    <div class="text-xl font-bold writing-vertical-rl font-serif tracking-widest">
        {card.name}
    </div>

    <div class="absolute bottom-1 right-2 rotate-180 opacity-50 text-sm">
        {card.suit}
    </div>
    
    </div>

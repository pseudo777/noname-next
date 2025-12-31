<script lang="ts">
    import type { CardDef, Suit} from '@core/types/api';

    // 接收参数
    let { card, selected, onclick } = $props<{
        card: CardDef, 
        selected: boolean,
        onclick: () => void
    }>();

    // 辅助函数：根据花色决定颜色
    const isRed = $derived(card.suit === 'heart' || card.suit === 'diamond');

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
    const pointMap: Record<number, string> = {
        1: 'A', 11: 'J', 12: 'Q', 13: 'K'
    };
    // 如果 card.point 不在 map 里（比如 2-10），回退显示原数字
    const pointStr = $derived(pointMap[card.point] || card.point.toString());


    // 新增：键盘处理函数
    function handleKeydown(e: KeyboardEvent) {
        // 如果按下回车或空格，也触发点击逻辑
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // 防止空格键导致页面滚动
            onclick();
        }
    }



</script>    
    

<div 
    class="card" 
    class:selected={selected} 
    onkeydown={handleKeydown}
    class:red={isRed}
    onclick={onclick}
    role="button"
    tabindex="0"
>
    <div class="top-left">
        <div class="point">{pointStr}</div>
        <div class="suit">{suitSymbol}</div>
    </div>
    
    <div class="name">{card.name}</div>
    
    <div class="bottom-right">
        {suitSymbol}
    </div>
</div>

<style>
    .card {
        width: 80px;
        height: 120px;
        background: #fdfdfd;
        border: 1px solid #999;
        border-radius: 6px;
        position: relative;
        cursor: pointer;
        user-select: none;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 1px 1px 3px rgba(0,0,0,0.2);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* 选中状态：向上浮动 + 高亮边框 */
    .card.selected {
        transform: translateY(-20px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        border-color: #4CAF50;
        z-index: 10;
    }

    .card.red { color: #D03B31; }
    .card:not(.red) { color: #222; }

    .top-left { position: absolute; top: 5px; left: 5px; text-align: center; line-height: 1; }
    .point { font-weight: bold; font-size: 1.1em; }
    .suit { font-size: 1.2em; }
    
    .name { font-size: 1.5em; font-family: "LiSu", "KaiTi", serif; /* 隶书更有味道 */ }
    
    .bottom-right { position: absolute; bottom: 5px; right: 5px; opacity: 0.3; transform: rotate(180deg); }
</style>
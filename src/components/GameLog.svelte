<script lang="ts">
    import { logger } from '@core/Logger.svelte';

    let container: HTMLDivElement;

    // Svelte 5 神技：副作用监听
    // 每当 logs 长度变化，自动滚动到底部
    $effect(() => {
        // 访问 logger.entries 是为了建立依赖关系
        const length = logger.entries.length;
        if (container) {
            // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
            });
        }
    });
</script>

<div class="log-panel" bind:this={container}>
    {#each logger.entries as entry (entry.id)}
        <div class="log-line">
            <span class="time">{new Date(entry.timestamp).toLocaleTimeString().slice(0,8)}</span>
            
            {#each entry.segments as seg}
                <span class="segment {seg.type}" title={seg.id}>
                    {seg.text}
                </span>
            {/each}
        </div>
    {/each}
</div>

<style>
    .log-panel {
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6); /* 半透明黑底 */
        border-radius: 8px;
        padding: 10px;
        overflow-y: auto;
        font-family: 'Consolas', monospace; /* 等宽字体更有极客感 */
        font-size: 0.9rem;
        color: #eee;
        border: 1px solid #444;
    }

    .log-line {
        margin-bottom: 4px;
        line-height: 1.4;
    }

    .time {
        color: #666;
        margin-right: 8px;
        font-size: 0.8em;
    }

    /* --- 富文本样式 --- */
    .segment.normal { color: #ccc; }
    
    .segment.player { 
        color: #4da6ff; /* 蓝色 */
        font-weight: bold;
        cursor: pointer;
    }
    .segment.player:hover { text-decoration: underline; }

    .segment.card { 
        color: #ffd700; /* 金色 */
        font-weight: bold;
    }

    .segment.skill {
        color: #ff7f50; /* 珊瑚色 */
        font-weight: bold;
    }

    .segment.damage { color: #ff4d4d; font-weight: bold; }
    .segment.heal { color: #4db873; font-weight: bold; }
</style>
<script lang="ts">
    import { assetManager } from '@core/AssetManager';
    import type { Player } from '@core/Player.svelte';

    // 接收一个 Player 对象作为参数
    let { player } = $props();

    // 动态计算图片地址
    // 使用 $derived 确保如果 player 变了，图片路径也会变
    let src = $derived(assetManager.getCharacterAvatar(player.id));

    // 处理图片加载失败的情况 (比如没有图片的武将)
    let loadError = $state(false);
</script>

<div class="avatar-container" class:dead={player.health.isDying}>
    {#if !loadError}
        <img 
            {src} 
            alt={player.name} 
            draggable="false"
            onerror={() => loadError = true}
        />
    {:else}
        <div class="fallback">
            {player.name[0]}
        </div>
    {/if}

    <div class="country-tag" data-country={player.country}>
        {player.country.toUpperCase()}
    </div>
</div>

<style>
    .avatar-container {
        width: 120px;
        height: 160px;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        background: #333;
        border: 2px solid #444;
        transition: filter 0.3s;
    }

    /* 濒死特效：黑白+红色边框 */
    .avatar-container.dead {
        filter: grayscale(100%);
        border-color: red;
        box-shadow: 0 0 10px red;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover; /* 保持比例填满 */
    }

    .fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 3em;
        font-weight: bold;
        background: #ddd;
    }

    .country-tag {
        position: absolute;
        top: 0;
        left: 0;
        padding: 2px 6px;
        color: white;
        font-size: 0.8em;
        font-weight: bold;
        border-bottom-right-radius: 8px;
    }

    /* 根据势力显示不同颜色 */
    [data-country="wei"] { background: #547998; }
    [data-country="shu"] { background: #D03B31; }
    [data-country="wu"]  { background: #4DB873; }
    [data-country="qun"] { background: #8A8A8A; }
</style>
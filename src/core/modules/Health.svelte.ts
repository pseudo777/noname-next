// src/core/modules/Health.svelte.ts
export class Health {
  // 基础数据
  current = $state(4);
  max = $state(4);

  // 可以在构造函数里初始化
  constructor(initial: number = 4) {
    this.current = initial;
    this.max = initial;
  }

  // 核心逻辑：只管血量，不管其他的
  damage(amount: number) {
    this.current -= amount;
    // 防止负数逻辑可以放在这，或者放在规则层
    if (this.current < 0) this.current = 0;
  }

  recover(amount: number) {
    if (this.current < this.max) {
      this.current += amount;
    }
  }

  // 派生状态：是否濒死
  // Svelte 5 的 $derived 会自动根据 current 变化而变化
  isDying = $derived(this.current <= 0);
}

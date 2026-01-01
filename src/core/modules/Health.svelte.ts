export class Health {
  current = $state(0);
  max = $state(0);
  constructor(max: number) {
    this.max = max;
    this.current = max;
  }
  damage(amount: number) {
    this.current -= amount;
  }
  recover(amount: number) {
    this.current = Math.min(this.current + amount, this.max);
  }
}

export const prefersReducedMotion = (): boolean =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** One value on a critically damped spring: it retargets from its current speed and never overshoots. */
export class CriticalSpring {
  value: number;
  velocity = 0;
  private readonly omega: number;

  constructor(value: number, responseSeconds: number) {
    this.value = value;
    this.omega = (2 * Math.PI) / responseSeconds;
  }

  step(target: number, seconds: number): void {
    const offset = this.value - target;
    const momentum = this.velocity + this.omega * offset;
    const decay = Math.exp(-this.omega * seconds);
    this.value = target + (offset + momentum * seconds) * decay;
    this.velocity = (momentum - this.omega * (offset + momentum * seconds)) * decay;
  }

  isAt(target: number, tolerance: number): boolean {
    return Math.abs(this.value - target) < tolerance && Math.abs(this.velocity) < tolerance * 10;
  }
}

/** Only the newest request may finish. Older ones report stale when they return. */
export class LatestRequest<K> {
  private token = 0;
  private current: K | null = null;

  get pending(): K | null {
    return this.current;
  }

  begin(key: K): number | null {
    if (this.current === key) return null;
    this.current = key;
    return ++this.token;
  }

  finish(token: number): boolean {
    if (token !== this.token) return false;
    this.current = null;
    return true;
  }

  cancel(): void {
    this.token++;
    this.current = null;
  }
}

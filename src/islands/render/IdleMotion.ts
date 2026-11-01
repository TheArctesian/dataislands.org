export interface IdlePose {
  readonly bob: number;
  readonly drift: readonly [number, number, number];
}

const AT_REST: IdlePose = { bob: 0, drift: [0, 0, 0] };

/** A pure function of time and phase. At t = 0 every island is at rest, which is what reduced motion shows. */
export function idlePose(t: number, phase: number): IdlePose {
  if (t === 0) return AT_REST;
  return {
    bob: Math.sin(t * 0.7 + phase) * 1.4,
    drift: [Math.sin(t * 0.13 + phase) * 3, Math.sin(t * 0.19 + phase * 2) * 4.5, Math.sin(t * 0.23 + phase * 3) * 2.5],
  };
}

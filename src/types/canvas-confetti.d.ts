// Minimal ambient declaration for `canvas-confetti`.
// The DefinitelyTyped package (@types/canvas-confetti) is not installed, and
// only the small subset of the API used by the app is described here.
declare module 'canvas-confetti' {
  export type Shape =
    | 'square'
    | 'circle'
    | 'star'
    | (string & {});

  export interface Options {
    /** How many particles to fire. Default 50. */
    particleCount?: number;
    /** Direction of the burst in degrees, 0 is straight up. Default 90. */
    angle?: number;
    /** Spread in degrees. Default 45. */
    spread?: number;
    /** Initial particle velocity. Default 45. */
    startVelocity?: number;
    /** How quickly particles slow down. Default 0.9. */
    decay?: number;
    /** Gravity effect on particles. Default 1. */
    gravity?: number;
    /** Particle size multiplier. Default 1. */
    scalar?: number;
    /** How many ticks the particles live. Default 200. */
    ticks?: number;
    /** CSS z-index for the canvas. Default 100. */
    zIndex?: number;
    /** Particle colours. */
    colors?: string[];
    /** Particle shapes. */
    shapes?: Shape | Shape[];
    /** Where the burst originates, as a fraction of the canvas. */
    origin?: { x?: number; y?: number };
    /** Skip animation entirely when the user prefers reduced motion. */
    disableForReducedMotion?: boolean;
  }

  export interface Confetti {
    (options?: Options | null): Promise<null> | null;
    create(
      canvas?: HTMLCanvasElement | null,
      options?: { resize?: boolean; useWorker?: boolean }
    ): Confetti;
  }

  const confetti: Confetti;
  export default confetti;
}

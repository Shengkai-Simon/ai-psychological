declare module "canvas-confetti" {
  type ConfettiOptions = {
    particleCount?: number
    angle?: number
    spread?: number
    startVelocity?: number
    decay?: number
    origin?: { x?: number; y?: number }
    colors?: string[]
    scalar?: number
  }
  const confetti: (options?: ConfettiOptions) => void
  export default confetti
}



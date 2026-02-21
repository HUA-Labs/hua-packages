/**
 * Spring physics calculation (Hooke's Law + damping)
 *
 * Pure function — no side effects, fully testable.
 */

export interface SpringConfig {
  stiffness: number
  damping: number
  mass: number
}

export interface SpringResult {
  value: number
  velocity: number
}

/**
 * Calculate one step of a damped spring simulation.
 *
 * @param currentValue   Current position
 * @param currentVelocity Current velocity
 * @param targetValue    Equilibrium (target) position
 * @param deltaTime      Time step in seconds
 * @param config         Spring parameters (stiffness, damping, mass)
 */
export function calculateSpring(
  currentValue: number,
  currentVelocity: number,
  targetValue: number,
  deltaTime: number,
  config: SpringConfig,
): SpringResult {
  const { stiffness, damping, mass } = config

  // Hooke's Law: F_spring = -k * x
  const displacement = currentValue - targetValue
  const springForce = -stiffness * displacement

  // Damping force: F_damping = -c * v
  const dampingForce = -damping * currentVelocity

  // Newton's second law: a = F / m
  const acceleration = (springForce + dampingForce) / mass

  // Semi-implicit Euler integration
  const newVelocity = currentVelocity + acceleration * deltaTime
  const newValue = currentValue + newVelocity * deltaTime

  return { value: newValue, velocity: newVelocity }
}

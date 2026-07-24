import * as THREE from "three";

export type CircleCollider = { x: number; z: number; r: number };

export class CollisionWorld {
  private colliders: CircleCollider[] = [];
  readonly bounds: number;

  constructor(bounds: number) {
    this.bounds = bounds;
  }

  add(collider: CircleCollider) {
    this.colliders.push(collider);
  }

  /** Pushes a position out of every overlapping collider and clamps to world bounds. */
  resolve(position: THREE.Vector3, radius: number) {
    for (const collider of this.colliders) {
      let dx = position.x - collider.x;
      let dz = position.z - collider.z;
      const minimum = collider.r + radius;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq >= minimum * minimum) continue;

      // Avoid division by zero when the position is exactly at the collider center.
      if (distanceSq === 0) {
        // Nudge the position out along the X axis by the minimum amount.
        position.x += minimum;
        continue;
      }

      const distance = Math.sqrt(distanceSq);
      const push = (minimum - distance) / distance;
      position.x += dx * push;
      position.z += dz * push;
    }
    position.x = THREE.MathUtils.clamp(position.x, -this.bounds, this.bounds);
    position.z = THREE.MathUtils.clamp(position.z, -this.bounds, this.bounds);
  }
}

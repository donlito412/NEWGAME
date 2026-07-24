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
      const dx = position.x - collider.x;
      const dz = position.z - collider.z;
      const minimum = collider.r + radius;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq >= minimum * minimum || distanceSq === 0) continue;
      const distance = Math.sqrt(distanceSq);
      const push = (minimum - distance) / distance;
      position.x += dx * push;
      position.z += dz * push;
    }
    position.x = THREE.MathUtils.clamp(position.x, -this.bounds, this.bounds);
    position.z = THREE.MathUtils.clamp(position.z, -this.bounds, this.bounds);
  }
}

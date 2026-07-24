import * as THREE from "three";

export const WORLD_SIZE = 260;
export const WORLD_BOUNDS = 122;

/** The main road: village entrance in the south, through the plaza, northeast to the mountain gate. */
export const ROAD: [number, number][] = [
  [0, 96], [0, 56], [0, 22], [0, -18], [14, -34], [30, -56], [48, -78], [64, -92], [80, -104],
];

export const PLAZA: [number, number] = [0, -20];
export const CAMP: [number, number] = [48, -78];
export const MOUNTAIN_GATE: [number, number] = [80, -104];

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function baseHeight(x: number, z: number) {
  return Math.sin(x * 0.026) * 1.6 + Math.cos(z * 0.022) * 1.3 + Math.sin((x + z) * 0.045) * 0.4;
}

export function distanceToRoad(x: number, z: number) {
  let best = Infinity;
  for (let index = 0; index < ROAD.length - 1; index += 1) {
    const [ax, az] = ROAD[index];
    const [bx, bz] = ROAD[index + 1];
    const abx = bx - ax;
    const abz = bz - az;
    const t = THREE.MathUtils.clamp(((x - ax) * abx + (z - az) * abz) / (abx * abx + abz * abz), 0, 1);
    const dx = x - (ax + abx * t);
    const dz = z - (az + abz * t);
    best = Math.min(best, Math.sqrt(dx * dx + dz * dz));
  }
  return best;
}

/** Final walkable terrain height: rolling hills flattened around the village and along the road. */
export function terrainHeight(x: number, z: number) {
  const rolling = baseHeight(x, z);
  const villageDistance = Math.hypot(x - PLAZA[0], z - PLAZA[1]);
  const villageFlat = 1 - smoothstep(30, 52, villageDistance);
  const roadFlat = 1 - smoothstep(4, 10, distanceToRoad(x, z));
  const flat = Math.max(villageFlat, roadFlat * 0.85);
  return THREE.MathUtils.lerp(rolling, 0.15, flat);
}

export function makeTerrain() {
  const geometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 128, 128);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  const colors: number[] = [];
  const grassLow = new THREE.Color(0x47703a);
  const grassHigh = new THREE.Color(0x8fb85e);
  const dirt = new THREE.Color(0xa8865a);
  const plazaDirt = new THREE.Color(0xb9976b);
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    const height = terrainHeight(x, z);
    positions.setY(index, height);
    let color = grassLow.clone().lerp(grassHigh, THREE.MathUtils.clamp((height + 2.5) / 5, 0, 1));
    const roadMix = 1 - smoothstep(2.6, 5.2, distanceToRoad(x, z));
    if (roadMix > 0) color = color.lerp(dirt, roadMix * 0.92);
    const plazaDistance = Math.hypot(x - PLAZA[0], z - PLAZA[1]);
    const plazaMix = 1 - smoothstep(9, 15, plazaDistance);
    if (plazaMix > 0) color = color.lerp(plazaDirt, plazaMix * 0.85);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const terrain = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }),
  );
  terrain.receiveShadow = true;
  return terrain;
}

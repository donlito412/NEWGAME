import * as THREE from "three";
import { AssetLibrary, normalizeModel } from "../engine/assets";
import { CollisionWorld } from "../engine/collision";
import { terrainHeight } from "./terrain";

const VILLAGE = "/assets/downloaded/medieval-village/";
const NATURE = "/assets/downloaded/stylized-nature/";
const MODELS = "/assets/downloaded/models/";
const KENNEY_NATURE = "/assets/free/kenney/nature-kit/Models/GLTF format/";
const KENNEY_SURVIVAL = "/assets/free/kenney/survival-kit/Models/GLB format/";

type Placement = {
  kind: "fbx" | "gltf";
  url: string;
  x: number;
  z: number;
  height: number;
  rotation?: number;
  collider?: number;
  /** Label used by the minimap for significant structures. */
  landmark?: string;
};

/** Village structures arranged around the plaza with the road running through. */
const STRUCTURES: Placement[] = [
  { kind: "fbx", url: `${VILLAGE}Fantasy Inn/Inn.fbx`, x: -22, z: -12, height: 11, rotation: 1.05, collider: 7.5, landmark: "inn" },
  { kind: "fbx", url: `${VILLAGE}Blacksmith/Blacksmith.fbx`, x: 21, z: -10, height: 9.5, rotation: -1.1, collider: 6.5, landmark: "smith" },
  { kind: "fbx", url: `${VILLAGE}Fantasy House/House_4.fbx`, x: -30, z: -38, height: 8.5, rotation: 0.5, collider: 6, landmark: "house" },
  { kind: "fbx", url: `${VILLAGE}Fantasy Barracks/House_3.fbx`, x: 26, z: -40, height: 9.5, rotation: -0.55, collider: 6.5, landmark: "house" },
  { kind: "fbx", url: `${VILLAGE}Fantasy Stable/Stable.fbx`, x: -34, z: 8, height: 8.2, rotation: Math.PI / 2, collider: 6.5, landmark: "stable" },
  { kind: "fbx", url: `${VILLAGE}Well/Well.fbx`, x: -6, z: -24, height: 3.6, collider: 2.2, landmark: "well" },
  { kind: "fbx", url: `${VILLAGE}Market Stand/MarketStand_1.fbx`, x: -12, z: -30, height: 4.1, rotation: 0.5, collider: 2.4 },
  { kind: "fbx", url: `${VILLAGE}Market Stand/MarketStand_2.fbx`, x: 9, z: -31, height: 4.1, rotation: -0.4, collider: 2.4 },
  { kind: "fbx", url: `${VILLAGE}Cart/Cart.fbx`, x: 13, z: -3, height: 3.2, rotation: 0.9, collider: 2.2 },
  { kind: "fbx", url: `${VILLAGE}Bonfire/Bonfire.fbx`, x: 4, z: -20, height: 2.2, collider: 1.6 },
];

/** Bandit camp on the mountain road (Kenney Survival Kit props). */
const CAMP_PROPS: Placement[] = [
  { kind: "gltf", url: `${KENNEY_SURVIVAL}tent.glb`, x: 53, z: -74, height: 3.4, rotation: -2.2, collider: 2.6 },
  { kind: "gltf", url: `${KENNEY_SURVIVAL}tent.glb`, x: 44, z: -84, height: 3.4, rotation: 0.6, collider: 2.6 },
  { kind: "gltf", url: `${KENNEY_SURVIVAL}campfire-pit.glb`, x: 48, z: -78, height: 1.1, collider: 1.2 },
  { kind: "gltf", url: `${KENNEY_SURVIVAL}box.glb`, x: 51, z: -81, height: 1.2, collider: 1 },
  { kind: "gltf", url: `${KENNEY_SURVIVAL}signpost.glb`, x: 3, z: 30, height: 2.6, rotation: 2.6, collider: 0.8 },
];

/** Individual Kenney trees and rocks lining the road and village edge (collidable). */
const TREES: Placement[] = [
  { kind: "gltf", url: `${KENNEY_NATURE}tree_oak.glb`, x: -8, z: 44, height: 9, collider: 1.3 },
  { kind: "gltf", url: `${KENNEY_NATURE}tree_pineRoundC.glb`, x: 9, z: 58, height: 11, collider: 1.3 },
  { kind: "gltf", url: `${KENNEY_NATURE}tree_oak.glb`, x: 12, z: 34, height: 8.4, rotation: 1.2, collider: 1.3 },
  { kind: "gltf", url: `${KENNEY_NATURE}tree_tall_dark.glb`, x: -13, z: 66, height: 12, collider: 1.4 },
  { kind: "gltf", url: `${KENNEY_NATURE}tree_pineRoundC.glb`, x: -16, z: 24, height: 10, rotation: 2.1, collider: 1.3 },
  { kind: "gltf", url: `${KENNEY_NATURE}tree_simple_dark.glb`, x: 22, z: -58, height: 9, collider: 1.3 },
  { kind: "gltf", url: `${KENNEY_NATURE}tree_oak.glb`, x: 40, z: -62, height: 9.4, rotation: 0.7, collider: 1.3 },
  { kind: "gltf", url: `${KENNEY_NATURE}tree_pineRoundC.glb`, x: 58, z: -68, height: 10.6, collider: 1.3 },
  { kind: "gltf", url: `${KENNEY_NATURE}tree_tall_dark.glb`, x: 38, z: -88, height: 11.4, collider: 1.4 },
  { kind: "gltf", url: `${KENNEY_NATURE}tree_simple_dark.glb`, x: -44, z: -22, height: 9, collider: 1.3 },
  { kind: "gltf", url: `${KENNEY_NATURE}tree_oak.glb`, x: -46, z: 30, height: 9.2, rotation: 1.9, collider: 1.3 },
  { kind: "gltf", url: `${KENNEY_NATURE}rock_largeA.glb`, x: 27, z: -70, height: 3.4, rotation: 0.4, collider: 2.4 },
  { kind: "gltf", url: `${KENNEY_NATURE}rock_largeA.glb`, x: 66, z: -84, height: 4, rotation: 2.2, collider: 2.6 },
  { kind: "gltf", url: `${KENNEY_NATURE}stone_tallB.glb`, x: 70, z: -100, height: 5.4, collider: 2.2 },
  { kind: "gltf", url: `${KENNEY_NATURE}stone_tallB.glb`, x: 88, z: -98, height: 5, rotation: 1.1, collider: 2.2 },
];

/** Large scenery outside the playable core: tree clusters, distant rocks, the mountain. */
const SCENERY: Placement[] = [
  { kind: "fbx", url: `${NATURE}Pine Trees/PineTrees.fbx`, x: -92, z: -84, height: 25, rotation: 0.3, collider: 12 },
  { kind: "fbx", url: `${NATURE}Pine Trees/PineTrees.fbx`, x: 82, z: 65, height: 23, rotation: -0.7, collider: 12 },
  { kind: "fbx", url: `${NATURE}Maple Trees/MapleTrees.fbx`, x: 88, z: -52, height: 22, rotation: -0.4, collider: 12 },
  { kind: "fbx", url: `${NATURE}Maple Trees/MapleTrees.fbx`, x: -73, z: 63, height: 21, rotation: 0.55, collider: 12 },
  { kind: "fbx", url: `${NATURE}Rocks/Rocks.fbx`, x: 62, z: 32, height: 13, rotation: 0.2, collider: 9 },
  { kind: "fbx", url: `${NATURE}Rocks/Rocks.fbx`, x: -68, z: -48, height: 11, rotation: -0.45, collider: 9 },
  { kind: "fbx", url: `${NATURE}Flower Bushes/FlowerBushes.fbx`, x: -28, z: 40, height: 4.5, rotation: 0.7 },
  { kind: "fbx", url: `${NATURE}Flower Bushes/FlowerBushes.fbx`, x: 24, z: -24, height: 4, rotation: -0.9 },
  { kind: "gltf", url: `${MODELS}mountain_fbx.glb`, x: 104, z: -128, height: 78, rotation: -0.35 },
];

export type LandmarkPoint = { x: number; z: number; label: string };

export async function buildWorld(
  assets: AssetLibrary,
  scene: THREE.Scene,
  collision: CollisionWorld,
): Promise<LandmarkPoint[]> {
  const landmarks: LandmarkPoint[] = [];
  const placeAll = [...STRUCTURES, ...CAMP_PROPS, ...TREES, ...SCENERY].map(async (item) => {
    const source = item.kind === "fbx" ? await assets.fbx(item.url) : (await assets.gltf(item.url)).scene;
    const model = normalizeModel(source.clone(true), item.height);
    model.position.set(item.x, terrainHeight(item.x, item.z), item.z);
    model.rotation.y = item.rotation ?? 0;
    scene.add(model);
    if (item.collider) collision.add({ x: item.x, z: item.z, r: item.collider });
    if (item.landmark) landmarks.push({ x: item.x, z: item.z, label: item.landmark });
  });
  await Promise.all(placeAll);
  return landmarks;
}

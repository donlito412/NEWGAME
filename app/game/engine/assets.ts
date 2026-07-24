import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

export type LoadedGLTF = { scene: THREE.Group; animations: THREE.AnimationClip[] };

export class AssetLibrary {
  readonly manager: THREE.LoadingManager;
  private gltfLoader: GLTFLoader;
  private fbxLoader: FBXLoader;
  private gltfCache = new Map<string, Promise<LoadedGLTF>>();
  private fbxCache = new Map<string, Promise<THREE.Group>>();

  constructor(onProgress: (ratio: number) => void) {
    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (_url, loaded, total) => {
      if (total > 0) onProgress(loaded / total);
    };
    this.gltfLoader = new GLTFLoader(this.manager);
    this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    this.fbxLoader = new FBXLoader(this.manager);
  }

  gltf(url: string): Promise<LoadedGLTF> {
    if (!this.gltfCache.has(url)) {
      this.gltfCache.set(
        url,
        new Promise((resolve, reject) =>
          this.gltfLoader.load(url, (file) => resolve({ scene: file.scene, animations: file.animations }), undefined, reject),
        ),
      );
    }
    return this.gltfCache.get(url)!;
  }

  fbx(url: string): Promise<THREE.Group> {
    if (!this.fbxCache.has(url)) {
      this.fbxCache.set(url, new Promise((resolve, reject) => this.fbxLoader.load(url, resolve, undefined, reject)));
    }
    return this.fbxCache.get(url)!;
  }
}

export function enableShadows(root: THREE.Object3D) {
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return root;
}

/** Scales a model to a target height and rests its feet at local y=0 inside a wrapper group. */
export function normalizeModel(root: THREE.Object3D, targetHeight: number) {
  enableShadows(root);
  const initial = new THREE.Box3().setFromObject(root);
  const height = initial.getSize(new THREE.Vector3()).y;
  root.scale.multiplyScalar(targetHeight / Math.max(height, 0.001));
  const scaled = new THREE.Box3().setFromObject(root);
  root.position.y -= scaled.min.y;
  const group = new THREE.Group();
  group.add(root);
  return group;
}

/** Every optional hand/back prop mesh that ships inside the KayKit character files. */
const KAYKIT_PROPS = [
  "1H_Axe_Offhand", "Barbarian_Round_Shield", "1H_Axe", "2H_Axe", "Mug",
  "1H_Sword_Offhand", "Badge_Shield", "Rectangle_Shield", "Round_Shield", "Spike_Shield", "1H_Sword", "2H_Sword",
  "Spellbook", "Spellbook_open", "1H_Wand", "2H_Staff",
  "Knife_Offhand", "1H_Crossbow", "2H_Crossbow", "Knife", "Throwable",
];

export type CharacterInstance = {
  group: THREE.Group;
  mixer: THREE.AnimationMixer;
  clips: Map<string, THREE.AnimationClip>;
};

/**
 * Clones an animated KayKit character, keeps only the requested hand props,
 * optionally tints its materials, and normalizes it to the target height.
 */
export function instantiateCharacter(
  source: LoadedGLTF,
  options: { height: number; keepProps?: string[]; tint?: number },
): CharacterInstance {
  const root = cloneSkeleton(source.scene);
  const keep = new Set(options.keepProps ?? []);
  root.traverse((child) => {
    if (KAYKIT_PROPS.includes(child.name)) child.visible = keep.has(child.name);
  });
  if (options.tint !== undefined) {
    const tint = new THREE.Color(options.tint);
    const seen = new Map<THREE.Material, THREE.Material>();
    root.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const replaced = materials.map((material) => {
          if (!seen.has(material)) {
            const copy = (material as THREE.MeshStandardMaterial).clone();
            copy.color.multiply(tint);
            seen.set(material, copy);
          }
          return seen.get(material)!;
        });
        child.material = Array.isArray(child.material) ? replaced : replaced[0];
      }
    });
  }
  const group = normalizeModel(root, options.height);
  const mixer = new THREE.AnimationMixer(root);
  const clips = new Map(source.animations.map((clip) => [clip.name, clip]));
  return { group, mixer, clips };
}

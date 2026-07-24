import * as THREE from "three";
import { AssetLibrary, instantiateCharacter } from "../engine/assets";
import { Actor } from "../engine/actor";
import { terrainHeight } from "./terrain";

const KAYKIT = "/assets/github/kaykit-adventurers/";
export const CHARACTER_HEIGHT = 2.9;

export type Npc = {
  id: string;
  name: string;
  actor: Actor;
  dialogue: string[];
  dialogueIndex: number;
  baseAnimation: string;
  waypoints?: [number, number][];
  waypointIndex: number;
};

export type Bandit = {
  actor: Actor;
  home: THREE.Vector3;
  patrol: [number, number][];
  patrolIndex: number;
  health: number;
  state: "patrol" | "chase" | "attack" | "stagger" | "dead";
  stateUntil: number;
  lastAttack: number;
};

export type Traveler = {
  actor: Actor;
  freed: boolean;
};

type NpcDef = {
  id: string;
  name: string;
  model: string;
  keepProps: string[];
  tint?: number;
  position: [number, number];
  rotation: number;
  baseAnimation: string;
  dialogue: string[];
  waypoints?: [number, number][];
};

const NPC_DEFS: NpcDef[] = [
  {
    id: "elder",
    name: "Elder Naiara",
    model: "Mage.glb",
    keepProps: ["2H_Staff"],
    position: [-3.4, -25.5],
    rotation: 0.8,
    baseAnimation: "Idle",
    dialogue: [
      "Elder Naiara: Thank goodness you came up the south road safely.",
      "Elder Naiara: Bandits took over the old rest camp on the mountain road. A traveler never made it through.",
      "Elder Naiara: Please - stop them and bring that traveler back safe.",
    ],
  },
  {
    id: "guard",
    name: "Tayo",
    model: "Knight.glb",
    keepProps: ["1H_Sword", "Rectangle_Shield"],
    position: [3.2, 24],
    rotation: Math.PI,
    baseAnimation: "Idle",
    dialogue: [
      "Tayo: Welcome to Amani. Keep to the road - the hills are rough country.",
      "Tayo: If you're headed for the mountain, talk to Elder Naiara first.",
    ],
  },
  {
    id: "smith",
    name: "Kofi",
    model: "Barbarian.glb",
    keepProps: ["1H_Axe"],
    position: [17, -14],
    rotation: -2.2,
    baseAnimation: "1H_Melee_Attack_Chop",
    dialogue: [
      "Kofi: Iron keeps this village fed as much as bread does.",
      "Kofi: That blade of yours - keep it sharp on the mountain road.",
    ],
  },
  {
    id: "merchant",
    name: "Zola",
    model: "Rogue_Hooded.glb",
    keepProps: [],
    tint: 0xcfe0b8,
    position: [-12.5, -32.5],
    rotation: 0.2,
    baseAnimation: "Idle",
    dialogue: [
      "Zola: Fresh goods up from the lowlands. Well - as fresh as the road allows.",
      "Zola: Caravans stopped coming since the trouble at the rest camp.",
    ],
  },
  {
    id: "walker",
    name: "Amara",
    model: "Mage.glb",
    keepProps: [],
    tint: 0xd8c896,
    position: [-28, 4],
    rotation: 0,
    baseAnimation: "Walking_A",
    dialogue: ["Amara: I walk this loop every morning. It keeps the worry down."],
    waypoints: [
      [-28, 4],
      [-14, -12],
      [-2, -22],
      [-16, -26],
      [-30, -6],
    ],
  },
];

async function makeActor(
  assets: AssetLibrary,
  model: string,
  options: { keepProps: string[]; tint?: number },
) {
  const source = await assets.gltf(`${KAYKIT}${model}`);
  const instance = instantiateCharacter(source, {
    height: CHARACTER_HEIGHT,
    keepProps: options.keepProps,
    tint: options.tint,
  });
  return new Actor(instance);
}

export async function createPlayer(assets: AssetLibrary, scene: THREE.Scene) {
  const actor = await makeActor(assets, "Rogue.glb", { keepProps: ["Knife"] });
  actor.group.position.set(0, terrainHeight(0, 88), 88);
  scene.add(actor.group);
  actor.play("Idle");
  return actor;
}

export async function createNpcs(assets: AssetLibrary, scene: THREE.Scene): Promise<Npc[]> {
  const npcs: Npc[] = [];
  for (const def of NPC_DEFS) {
    const actor = await makeActor(assets, def.model, { keepProps: def.keepProps, tint: def.tint });
    actor.group.position.set(def.position[0], terrainHeight(def.position[0], def.position[1]), def.position[1]);
    actor.group.rotation.y = def.rotation;
    scene.add(actor.group);
    actor.play(def.baseAnimation, { timeScale: def.id === "smith" ? 0.7 : 1 });
    npcs.push({
      id: def.id,
      name: def.name,
      actor,
      dialogue: def.dialogue,
      dialogueIndex: 0,
      baseAnimation: def.baseAnimation,
      waypoints: def.waypoints,
      waypointIndex: 0,
    });
  }
  return npcs;
}

const BANDIT_SPOTS: { home: [number, number]; patrol: [number, number][] }[] = [
  { home: [46, -72], patrol: [[46, -72], [54, -70], [50, -76]] },
  { home: [42, -80], patrol: [[42, -80], [38, -74], [46, -84]] },
  { home: [54, -84], patrol: [[54, -84], [60, -78], [50, -88]] },
];

export async function createBandits(assets: AssetLibrary, scene: THREE.Scene): Promise<Bandit[]> {
  const bandits: Bandit[] = [];
  for (const spot of BANDIT_SPOTS) {
    const actor = await makeActor(assets, "Rogue_Hooded.glb", { keepProps: ["Knife"], tint: 0x9a625a });
    actor.group.position.set(spot.home[0], terrainHeight(spot.home[0], spot.home[1]), spot.home[1]);
    scene.add(actor.group);
    actor.play("Idle");
    bandits.push({
      actor,
      home: actor.group.position.clone(),
      patrol: spot.patrol,
      patrolIndex: 0,
      health: 3,
      state: "patrol",
      stateUntil: 0,
      lastAttack: 0,
    });
  }
  return bandits;
}

export async function createTraveler(assets: AssetLibrary, scene: THREE.Scene): Promise<Traveler> {
  const actor = await makeActor(assets, "Rogue.glb", { keepProps: [], tint: 0x9cc4de });
  actor.group.position.set(49.5, terrainHeight(49.5, -74.5), -74.5);
  actor.group.rotation.y = 2.4;
  scene.add(actor.group);
  actor.play("Sit_Floor_Idle");
  return { actor, freed: false };
}

/** Simple waypoint walking for villager routines. */
export function updateNpcRoutine(npc: Npc, delta: number) {
  if (!npc.waypoints) return;
  const position = npc.actor.group.position;
  const [tx, tz] = npc.waypoints[npc.waypointIndex];
  const dx = tx - position.x;
  const dz = tz - position.z;
  const distance = Math.hypot(dx, dz);
  if (distance < 0.6) {
    npc.waypointIndex = (npc.waypointIndex + 1) % npc.waypoints.length;
    return;
  }
  const speed = 1.8;
  position.x += (dx / distance) * speed * delta;
  position.z += (dz / distance) * speed * delta;
  position.y = terrainHeight(position.x, position.z);
  const heading = Math.atan2(dx, dz);
  const difference = Math.atan2(Math.sin(heading - npc.actor.group.rotation.y), Math.cos(heading - npc.actor.group.rotation.y));
  npc.actor.group.rotation.y += difference * Math.min(1, delta * 8);
}

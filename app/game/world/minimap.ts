import { ROAD } from "./terrain";
import type { LandmarkPoint } from "./layout";

export type MinimapState = {
  player: { x: number; z: number; yaw: number };
  npcs: { x: number; z: number }[];
  enemies: { x: number; z: number }[];
  objective: [number, number] | null;
  landmarks: LandmarkPoint[];
};

const RANGE = 78;

export function drawMinimap(canvas: HTMLCanvasElement, state: MinimapState) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const size = canvas.width;
  const half = size / 2;
  const toMap = (x: number, z: number): [number, number] => [
    half + ((x - state.player.x) / RANGE) * half,
    half + ((z - state.player.z) / RANGE) * half,
  ];

  context.clearRect(0, 0, size, size);
  context.save();
  context.beginPath();
  context.arc(half, half, half - 2, 0, Math.PI * 2);
  context.clip();

  context.fillStyle = "#3f7a4c";
  context.fillRect(0, 0, size, size);

  // Road
  context.strokeStyle = "#c9a36a";
  context.lineWidth = 5;
  context.lineJoin = "round";
  context.beginPath();
  ROAD.forEach(([x, z], index) => {
    const [mx, my] = toMap(x, z);
    if (index === 0) context.moveTo(mx, my);
    else context.lineTo(mx, my);
  });
  context.stroke();

  // Landmarks (buildings)
  context.fillStyle = "#f3e6c2";
  for (const landmark of state.landmarks) {
    const [mx, my] = toMap(landmark.x, landmark.z);
    context.fillRect(mx - 4, my - 4, 8, 8);
  }

  // NPCs
  context.fillStyle = "#9fe08c";
  for (const npc of state.npcs) {
    const [mx, my] = toMap(npc.x, npc.z);
    context.beginPath();
    context.arc(mx, my, 3, 0, Math.PI * 2);
    context.fill();
  }

  // Enemies
  context.fillStyle = "#e05545";
  for (const enemy of state.enemies) {
    const [mx, my] = toMap(enemy.x, enemy.z);
    context.beginPath();
    context.arc(mx, my, 3.6, 0, Math.PI * 2);
    context.fill();
  }

  // Objective
  if (state.objective) {
    const [mx, my] = toMap(state.objective[0], state.objective[1]);
    context.strokeStyle = "#f6b83f";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(mx, my, 6.5, 0, Math.PI * 2);
    context.stroke();
  }

  // Player arrow
  context.translate(half, half);
  context.rotate(-state.player.yaw + Math.PI);
  context.fillStyle = "#f6b83f";
  context.strokeStyle = "#173c2c";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, -8);
  context.lineTo(6, 7);
  context.lineTo(0, 3.5);
  context.lineTo(-6, 7);
  context.closePath();
  context.fill();
  context.stroke();
  context.restore();
}

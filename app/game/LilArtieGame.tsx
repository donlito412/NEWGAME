"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AssetLibrary } from "./engine/assets";
import { CollisionWorld } from "./engine/collision";
import type { Actor } from "./engine/actor";
import { makeTerrain, terrainHeight, PLAZA, MOUNTAIN_GATE, WORLD_BOUNDS } from "./world/terrain";
import { buildWorld, type LandmarkPoint } from "./world/layout";
import {
  createPlayer,
  createNpcs,
  createBandits,
  createTraveler,
  updateNpcRoutine,
  type Bandit,
  type Npc,
  type Traveler,
} from "./world/characters";
import { QuestLine } from "./world/quests";
import { drawMinimap } from "./world/minimap";

type HudState = {
  health: number;
  stamina: number;
  time: string;
  quest: string;
  detail: string;
  prompt: string;
  toast: string;
};

const SPAWN: [number, number] = [0, 88];

export function LilArtieGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const pressedRef = useRef<Record<string, boolean>>({});
  const actionsRef = useRef<{ attack: () => void; interact: () => void; jump: () => void }>({
    attack: () => {},
    interact: () => {},
    jump: () => {},
  });
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hud, setHud] = useState<HudState>({
    health: 5,
    stamina: 100,
    time: "08:10",
    quest: "Road Through Amani",
    detail: "Follow the dirt road south into Amani village.",
    prompt: "",
    toast: "",
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8ccbd8);
    scene.fog = new THREE.FogExp2(0xa9cfc3, 0.0055);

    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 650);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.className = "game-canvas";
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute("aria-label", "Lil Artie open world game");
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfff0cf, 0x38543b, 2.2));
    const sun = new THREE.DirectionalLight(0xffe2a4, 3.6);
    sun.position.set(-48, 72, 32);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -110;
    sun.shadow.camera.right = 110;
    sun.shadow.camera.top = 110;
    sun.shadow.camera.bottom = -110;
    scene.add(sun, makeTerrain());

    const assets = new AssetLibrary((ratio) => setProgress(ratio));
    const collision = new CollisionWorld(WORLD_BOUNDS);
    const quest = new QuestLine();

    let player: Actor | null = null;
    let npcs: Npc[] = [];
    let bandits: Bandit[] = [];
    let traveler: Traveler | null = null;
    let landmarks: LandmarkPoint[] = [];
    let ready = false;

    const clock = new THREE.Clock();
    let toastText = "";
    let toastUntil = 0;
    const toast = (message: string, seconds = 3.5) => {
      toastText = message;
      toastUntil = clock.elapsedTime + seconds;
    };

    const setup = async () => {
      try {
        const [worldLandmarks, playerActor, npcList, banditList, travelerActor] = await Promise.all([
          buildWorld(assets, scene, collision),
          createPlayer(assets, scene),
          createNpcs(assets, scene),
          createBandits(assets, scene),
          createTraveler(assets, scene),
        ]);
        landmarks = worldLandmarks;
        player = playerActor;
        npcs = npcList;
        bandits = banditList;
        traveler = travelerActor;
        ready = true;
      } catch (error) {
        console.error("Asset setup failed", error);
        toast("An asset failed to load. Check the console.", 8);
      } finally {
        setLoaded(true);
      }
    };
    void setup();

    // ---- player state ----
    const keys = pressedRef.current;
    const velocity = new THREE.Vector3();
    const move = new THREE.Vector3();
    const target = new THREE.Vector3();
    let cameraYaw = Math.PI;
    let cameraPitch = 0.42;
    let cameraDistance = 9.5;
    let dragging = false;
    let dragPointer = -1;
    let lastX = 0;
    let lastY = 0;
    let health = 5;
    let stamina = 100;
    let verticalVelocity = 0;
    let grounded = true;
    let airborne = false;
    let playerBusyUntil = 0; // attack/hit/death lock on locomotion animations
    let dead = false;
    let pendingHitAt = 0;
    let hasPendingHit = false;
    let lastDamage = 0;
    let hudTick = 0;

    const playerPosition = () => player!.group.position;

    const respawn = () => {
      health = 5;
      dead = false;
      playerBusyUntil = 0;
      playerPosition().set(SPAWN[0], terrainHeight(SPAWN[0], SPAWN[1]), SPAWN[1]);
      player!.play("Idle");
      toast("You wake near the south road, patched up.", 4);
    };

    const attack = () => {
      if (!ready || dead || clock.elapsedTime < playerBusyUntil) return;
      playerBusyUntil = clock.elapsedTime + 0.6;
      pendingHitAt = clock.elapsedTime + 0.24;
      hasPendingHit = true;
      player!.play("1H_Melee_Attack_Slice_Horizontal", { loop: false, timeScale: 1.35, fade: 0.08 });
    };

    const applyAttackHit = () => {
      const forward = new THREE.Vector3(Math.sin(player!.group.rotation.y), 0, Math.cos(player!.group.rotation.y));
      for (const bandit of bandits) {
        if (bandit.state === "dead") continue;
        const distance = playerPosition().distanceTo(bandit.actor.group.position);
        if (distance > 3.4) continue;
        const direction = bandit.actor.group.position.clone().sub(playerPosition()).setY(0).normalize();
        if (forward.dot(direction) < 0.05) continue;
        bandit.health -= 1;
        if (bandit.health <= 0) {
          bandit.state = "dead";
          bandit.actor.play("Death_A", { loop: false, fade: 0.1 });
          const remaining = bandits.filter((entry) => entry.state !== "dead").length;
          toast(remaining ? `Bandit down. ${remaining} left.` : "The camp is quiet.", 2.5);
        } else {
          bandit.state = "stagger";
          bandit.stateUntil = clock.elapsedTime + 0.5;
          bandit.actor.play("Hit_A", { loop: false, fade: 0.08 });
          bandit.actor.group.position.addScaledVector(direction, 1.1);
        }
      }
    };

    const damagePlayer = () => {
      if (dead || clock.elapsedTime - lastDamage < 0.6) return;
      lastDamage = clock.elapsedTime;
      health = Math.max(0, health - 1);
      if (health === 0) {
        dead = true;
        playerBusyUntil = clock.elapsedTime + 1.9;
        player!.play("Death_A", { loop: false, fade: 0.1, onFinished: () => setTimeout(respawn, 400) });
        toast("You are overwhelmed...", 3);
      } else if (clock.elapsedTime >= playerBusyUntil) {
        playerBusyUntil = clock.elapsedTime + 0.35;
        player!.play("Hit_A", { loop: false, fade: 0.08 });
        toast("Step back and counterattack.", 2);
      }
    };

    const interact = () => {
      if (!ready || dead) return;
      const position = playerPosition();

      if (traveler && !traveler.freed && quest.stage === "FREE_TRAVELER" && position.distanceTo(traveler.actor.group.position) < 5) {
        traveler.freed = true;
        traveler.actor.play("Sit_Floor_StandUp", {
          loop: false,
          onFinished: () => {
            traveler!.actor.play("Cheer", { loop: false, onFinished: () => traveler!.actor.play("Idle") });
          },
        });
        quest.advance("ROAD_OPEN");
        toast("Traveler: You came for me? Amani raises good people. Thank you.", 5);
        return;
      }

      let nearest: Npc | null = null;
      let nearestDistance = 4.6;
      for (const npc of npcs) {
        const distance = position.distanceTo(npc.actor.group.position);
        if (distance < nearestDistance) {
          nearest = npc;
          nearestDistance = distance;
        }
      }
      if (!nearest) return;
      const facing = position.clone().sub(nearest.actor.group.position).setY(0);
      nearest.actor.group.rotation.y = Math.atan2(facing.x, facing.z);

      if (nearest.id === "elder" && quest.stage === "TALK_ELDER") {
        toast(nearest.dialogue[nearest.dialogueIndex], 4.5);
        nearest.dialogueIndex += 1;
        if (nearest.dialogueIndex >= nearest.dialogue.length) {
          nearest.dialogueIndex = 0;
          quest.advance("CLEAR_CAMP");
        }
        return;
      }
      toast(nearest.dialogue[nearest.dialogueIndex % nearest.dialogue.length], 4.5);
      nearest.dialogueIndex += 1;
    };

    const jump = () => {
      if (grounded && !dead && clock.elapsedTime >= playerBusyUntil) {
        verticalVelocity = 7.4;
        grounded = false;
        airborne = true;
        player?.play("Jump_Start", { loop: false, fade: 0.08, onFinished: () => player?.play("Jump_Idle") });
      }
    };

    actionsRef.current = { attack, interact, jump };

    const onKeyDown = (event: KeyboardEvent) => {
      keys[event.code] = true;
      if (event.code === "Space") jump();
      if (event.code === "KeyF" || event.code === "Enter") attack();
      if (event.code === "KeyE") interact();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys[event.code] = false;
    };
    const onPointerDown = (event: PointerEvent) => {
      renderer.domElement.focus();
      if (event.button === 0) attack();
      if (event.button === 1 || event.button === 2) {
        dragging = true;
        dragPointer = event.pointerId;
        lastX = event.clientX;
        lastY = event.clientY;
        renderer.domElement.setPointerCapture(event.pointerId);
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== dragPointer) return;
      cameraYaw -= (event.clientX - lastX) * 0.007;
      cameraPitch = THREE.MathUtils.clamp(cameraPitch + (event.clientY - lastY) * 0.005, 0.12, 1.05);
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId === dragPointer) {
        dragging = false;
        dragPointer = -1;
        if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
      }
    };
    const onWheel = (event: WheelEvent) => {
      cameraDistance = THREE.MathUtils.clamp(cameraDistance + event.deltaY * 0.012, 5.5, 15);
    };
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    const onContext = (event: MouseEvent) => event.preventDefault();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });
    renderer.domElement.addEventListener("contextmenu", onContext);

    camera.position.set(0, 8, 98);

    const updateBandit = (bandit: Bandit, delta: number, now: number) => {
      if (bandit.state === "dead") return;
      const position = bandit.actor.group.position;
      const distance = position.distanceTo(playerPosition());

      if (bandit.state === "stagger") {
        if (now >= bandit.stateUntil) bandit.state = "chase";
        return;
      }
      if (bandit.state === "attack") {
        if (now >= bandit.stateUntil) {
          if (distance < 3) damagePlayer();
          bandit.state = "chase";
        }
        return;
      }
      if (bandit.state === "chase") {
        if (distance > 30) {
          bandit.state = "patrol";
        } else if (distance < 2.2 && now - bandit.lastAttack > 1.5) {
          bandit.lastAttack = now;
          bandit.state = "attack";
          bandit.stateUntil = now + 0.55;
          const direction = playerPosition().clone().sub(position).setY(0);
          bandit.actor.group.rotation.y = Math.atan2(direction.x, direction.z);
          bandit.actor.play("1H_Melee_Attack_Stab", { loop: false, timeScale: 1.2, fade: 0.08 });
        } else if (distance >= 2) {
          const direction = playerPosition().clone().sub(position).setY(0).normalize();
          position.addScaledVector(direction, delta * 4.1);
          bandit.actor.group.rotation.y = Math.atan2(direction.x, direction.z);
          bandit.actor.play("Running_A");
        } else {
          bandit.actor.play("Idle");
        }
      } else {
        // patrol
        if (distance < 14) {
          bandit.state = "chase";
          return;
        }
        const [tx, tz] = bandit.patrol[bandit.patrolIndex];
        const dx = tx - position.x;
        const dz = tz - position.z;
        const step = Math.hypot(dx, dz);
        if (step < 0.8) {
          bandit.patrolIndex = (bandit.patrolIndex + 1) % bandit.patrol.length;
          bandit.actor.play("Idle");
        } else {
          position.x += (dx / step) * delta * 1.5;
          position.z += (dz / step) * delta * 1.5;
          bandit.actor.group.rotation.y = Math.atan2(dx, dz);
          bandit.actor.play("Walking_A");
        }
      }
      collision.resolve(position, 0.75);
      position.y = terrainHeight(position.x, position.z);
    };

    let animationId = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.035);
      const now = clock.elapsedTime;

      if (ready && player) {
        // --- movement ---
        move.set(0, 0, 0);
        if (keys.KeyW || keys.ArrowUp) move.z -= 1;
        if (keys.KeyS || keys.ArrowDown) move.z += 1;
        if (keys.KeyA || keys.ArrowLeft) move.x -= 1;
        if (keys.KeyD || keys.ArrowRight) move.x += 1;
        const wantsMove = move.lengthSq() > 0 && !dead;
        const sprinting = (keys.ShiftLeft || keys.ShiftRight) && wantsMove && stamina > 2;
        const speed = sprinting ? 11 : 6.5;
        stamina = THREE.MathUtils.clamp(stamina + (sprinting ? -30 : 20) * delta, 0, 100);
        const position = playerPosition();
        if (wantsMove) {
          move.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
          velocity.lerp(move.multiplyScalar(speed), 0.22);
          position.addScaledVector(velocity, delta);
          const heading = Math.atan2(velocity.x, velocity.z);
          const difference = Math.atan2(Math.sin(heading - player.group.rotation.y), Math.cos(heading - player.group.rotation.y));
          player.group.rotation.y += difference * Math.min(1, delta * 13);
        } else {
          velocity.multiplyScalar(Math.pow(0.005, delta));
        }
        collision.resolve(position, 0.8);

        // --- gravity / ground ---
        verticalVelocity -= 18 * delta;
        position.y += verticalVelocity * delta;
        const ground = terrainHeight(position.x, position.z);
        if (position.y <= ground) {
          position.y = ground;
          verticalVelocity = 0;
          if (!grounded && airborne) {
            airborne = false;
            playerBusyUntil = Math.max(playerBusyUntil, now + 0.18);
            player.play("Jump_Land", { loop: false, fade: 0.08 });
          }
          grounded = true;
        }

        // --- attack hit window ---
        if (hasPendingHit && now >= pendingHitAt) {
          hasPendingHit = false;
          applyAttackHit();
        }

        // --- locomotion animation ---
        if (!dead && grounded && now >= playerBusyUntil) {
          const horizontal = Math.hypot(velocity.x, velocity.z);
          if (!wantsMove || horizontal < 0.4) player.play("Idle");
          else if (sprinting || horizontal > 8) player.play("Running_A");
          else player.play("Walking_A");
        }

        // --- world updates ---
        for (const npc of npcs) {
          updateNpcRoutine(npc, delta);
          npc.actor.update(delta);
        }
        for (const bandit of bandits) {
          updateBandit(bandit, delta, now);
          bandit.actor.update(delta);
        }
        traveler?.actor.update(delta);
        player.update(delta);

        // --- quest progression ---
        if (quest.stage === "REACH_VILLAGE" && Math.hypot(position.x - PLAZA[0], position.z - PLAZA[1]) < 11) {
          quest.advance("TALK_ELDER");
          toast("Amani village. The elder waits by the well.", 4);
        } else if (quest.stage === "CLEAR_CAMP" && bandits.every((bandit) => bandit.state === "dead")) {
          quest.advance("FREE_TRAVELER");
          toast("The bandits are beaten. Someone is tied up by the fire.", 4);
        } else if (quest.stage === "ROAD_OPEN" && Math.hypot(position.x - MOUNTAIN_GATE[0], position.z - MOUNTAIN_GATE[1]) < 9) {
          quest.advance("COMPLETE");
          toast("The mountain road is open. Region one is secure.", 6);
        }

        // --- camera ---
        target.set(position.x, position.y + 2.1, position.z);
        const desired = new THREE.Vector3(
          Math.sin(cameraYaw) * Math.cos(cameraPitch) * cameraDistance,
          Math.sin(cameraPitch) * cameraDistance + 1.1,
          Math.cos(cameraYaw) * Math.cos(cameraPitch) * cameraDistance,
        ).add(target);
        camera.position.lerp(desired, 1 - Math.pow(0.0008, delta));
        camera.lookAt(target);

        // --- minimap ---
        const minimap = minimapRef.current;
        if (minimap) {
          drawMinimap(minimap, {
            player: { x: position.x, z: position.z, yaw: player.group.rotation.y },
            npcs: npcs.map((npc) => ({ x: npc.actor.group.position.x, z: npc.actor.group.position.z })),
            enemies: bandits
              .filter((bandit) => bandit.state !== "dead")
              .map((bandit) => ({ x: bandit.actor.group.position.x, z: bandit.actor.group.position.z })),
            objective: quest.view.objective,
            landmarks,
          });
        }

        // --- HUD ---
        if (now - hudTick > 0.12) {
          hudTick = now;
          let prompt = "";
          if (!dead) {
            if (traveler && !traveler.freed && quest.stage === "FREE_TRAVELER" && position.distanceTo(traveler.actor.group.position) < 5) {
              prompt = "E  Free the traveler";
            } else {
              for (const npc of npcs) {
                if (position.distanceTo(npc.actor.group.position) < 4.6) {
                  prompt = `E  Talk to ${npc.name}`;
                  break;
                }
              }
            }
          }
          const daylight = (now * 0.3 + 8.15) % 24;
          setHud({
            health,
            stamina,
            time: `${String(Math.floor(daylight)).padStart(2, "0")}:${String(Math.floor((daylight % 1) * 60)).padStart(2, "0")}`,
            quest: quest.view.title,
            detail: quest.view.detail,
            prompt,
            toast: now < toastUntil ? toastText : "",
          });
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("contextmenu", onContext);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  const setTouch = (code: string, value: boolean) => {
    pressedRef.current[code] = value;
  };
  const touchButton = (label: string, className: string, code: string) => (
    <button
      className={`touch-btn ${className}`}
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        setTouch(code, true);
      }}
      onPointerUp={() => setTouch(code, false)}
      onPointerCancel={() => setTouch(code, false)}
      onPointerLeave={() => setTouch(code, false)}
    >
      {label}
    </button>
  );

  return (
    <main className="game-shell">
      <div ref={mountRef} className="game-mount" />
      <div className="grain" />
      <div className={`loading ${loaded ? "done" : ""}`}>
        <div className="loading-inner">
          <div className="loading-mark">Lil Artie</div>
          <p>Loading the roads of Amani...</p>
          <div className="loading-bar">
            <span style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        </div>
      </div>

      <section className="hud" aria-label="Game status">
        <header className="brand">
          <p className="eyebrow">An open-world adventure</p>
          <h1>
            Lil Artie <span>Roads of Amani</span>
          </h1>
        </header>
        <div className="status">
          <div className="hearts" aria-label={`${hud.health} health`}>
            {[0, 1, 2, 3, 4].map((heart) => (
              <span key={heart} className={heart < hud.health ? "heart" : "heart empty"}>
                ♥
              </span>
            ))}
          </div>
          <div className="stamina" aria-label={`${Math.round(hud.stamina)} percent stamina`}>
            <span style={{ width: `${hud.stamina}%` }} />
          </div>
          <div className="clock">{hud.time}</div>
        </div>
        <div className="quest-card">
          <p className="label">Current situation</p>
          <p className="title">{hud.quest}</p>
          <p className="detail">{hud.detail}</p>
        </div>
        <div className="minimap" aria-label="Area map">
          <canvas ref={minimapRef} className="minimap-canvas" width={140} height={140} />
          <span className="north">N</span>
        </div>
      </section>

      {hud.prompt && (
        <div className="prompt">
          <kbd>{hud.prompt.slice(0, 1)}</kbd>
          {hud.prompt.slice(1)}
        </div>
      )}
      {hud.toast && (
        <div className="toast" role="status">
          {hud.toast}
        </div>
      )}
      <div className="controls">
        <strong>MOVE</strong> WASD
        <br />
        <strong>SPRINT</strong> SHIFT
        <br />
        <strong>JUMP</strong> SPACE
        <br />
        <strong>ATTACK</strong> CLICK / F
        <br />
        <strong>INTERACT</strong> E
        <br />
        <strong>CAMERA</strong> RIGHT-DRAG
        <br />
        <strong>ZOOM</strong> WHEEL
      </div>

      <div className="touch-controls" aria-label="Touch controls">
        <div className="dpad">
          {touchButton("▲", "touch-up", "KeyW")}
          {touchButton("◀", "touch-left", "KeyA")}
          {touchButton("▼", "touch-down", "KeyS")}
          {touchButton("▶", "touch-right", "KeyD")}
        </div>
        <div className="actions">
          {touchButton("Run", "", "ShiftLeft")}
          <button className="touch-btn" onPointerDown={() => actionsRef.current.jump()}>
            Jump
          </button>
          <button className="touch-btn attack" onPointerDown={() => actionsRef.current.attack()}>
            Attack
          </button>
          <button className="touch-btn" onPointerDown={() => actionsRef.current.interact()}>
            Talk
          </button>
        </div>
      </div>
    </main>
  );
}

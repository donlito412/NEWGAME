import * as THREE from "three";
import type { CharacterInstance } from "./assets";

export type PlayOptions = {
  loop?: boolean;
  fade?: number;
  timeScale?: number;
  onFinished?: () => void;
};

/** Wraps an animated character with crossfaded named-clip playback. */
export class Actor {
  readonly group: THREE.Group;
  private mixer: THREE.AnimationMixer;
  private clips: Map<string, THREE.AnimationClip>;
  private actions = new Map<string, THREE.AnimationAction>();
  private current: THREE.AnimationAction | null = null;
  currentName = "";
  private finishedCallback: (() => void) | null = null;

  constructor(instance: CharacterInstance) {
    this.group = instance.group;
    this.mixer = instance.mixer;
    this.clips = instance.clips;
    this.mixer.addEventListener("finished", () => {
      const callback = this.finishedCallback;
      this.finishedCallback = null;
      if (callback) callback();
    });
  }

  play(name: string, options: PlayOptions = {}) {
    if (this.currentName === name && options.loop !== false) return;
    const clip = this.clips.get(name);
    if (!clip) return;
    if (!this.actions.has(name)) this.actions.set(name, this.mixer.clipAction(clip));
    const action = this.actions.get(name)!;
    const fade = options.fade ?? 0.18;
    action.reset();
    action.setLoop(options.loop === false ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = options.loop === false;
    action.timeScale = options.timeScale ?? 1;
    if (this.current && this.current !== action) this.current.crossFadeTo(action, fade, false);
    action.play();
    this.current = action;
    this.currentName = name;
    this.finishedCallback = options.loop === false ? options.onFinished ?? null : null;
  }

  update(delta: number) {
    this.mixer.update(delta);
  }
}

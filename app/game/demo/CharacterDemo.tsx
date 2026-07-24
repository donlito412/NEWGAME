import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type LoadedCharacter = {
  name: string;
  gltf?: THREE.Group & { animations?: THREE.AnimationClip[] };
  mixer?: THREE.AnimationMixer;
  actions?: Record<string, THREE.AnimationAction>;
};

const CHARACTER_PATHS = [
  { name: 'Fox', path: '/assets/characters/Fox.glb' },
  { name: 'CesiumMan', path: '/assets/characters/CesiumMan.glb' },
  { name: 'Robot', path: '/assets/characters/robot.glb' },
];

export default function CharacterDemo() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState<LoadedCharacter[]>([]);
  const mixersRef = useRef<THREE.AnimationMixer[]>([]);

  useEffect(() => {
    const mount = mountRef.current!;
    const width = mount.clientWidth || 800;
    const height = 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa8d0c6);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 1.6, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    hemi.position.set(0, 20, 0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    const grid = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
    scene.add(grid);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    const loader = new GLTFLoader();

    let localLoaded: LoadedCharacter[] = [];

    function loadCharacter(info: { name: string; path: string }) {
      loader.load(info.path, (gltf) => {
        const group = gltf.scene;
        group.name = info.name;
        group.position.set(localLoaded.length * 1.5 - 1.5, 0, 0);
        scene.add(group);

        const mixer = new THREE.AnimationMixer(group);
        mixersRef.current.push(mixer);

        const actions: Record<string, THREE.AnimationAction> = {};
        for (const clip of gltf.animations ?? []) {
          actions[clip.name] = mixer.clipAction(clip);
        }

        // Auto-play the first available animation if present
        if (gltf.animations && gltf.animations.length > 0) {
          const clip = gltf.animations.find((a) => /idle/i.test(a.name)) ?? gltf.animations[0];
          const action = mixer.clipAction(clip);
          action.play();
        }

        localLoaded.push({ name: info.name, gltf: group as any, mixer, actions });
        setLoaded([...localLoaded]);
      }, undefined, (err) => {
        console.error('Failed to load', info.path, err);
      });
    }

    for (const c of CHARACTER_PATHS) loadCharacter(c);

    const clock = new THREE.Clock();
    let stopped = false;
    function animate() {
      if (stopped) return;
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      for (const m of mixersRef.current) m.update(delta);
      renderer.render(scene, camera);
    }
    animate();

    // cleanup
    return () => {
      stopped = true;
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  function playAnimation(characterIndex: number, clipName?: string) {
    const item = loaded[characterIndex];
    if (!item || !item.gltf || !item.mixer) return;
    const animations = (item.gltf as any).animations ?? [];
    if (animations.length === 0) return;
    const clip = animations.find((a: any) => clipName ? a.name.toLowerCase().includes(clipName.toLowerCase()) : /idle/i.test(a.name)) ?? animations[0];
    const action = item.mixer!.clipAction(clip);
    // crossfade
    item.mixer!.stopAllAction();
    action.reset().fadeIn(0.1).play();
  }

  return (
    <div>
      <h2>Character Demo</h2>
      <div ref={mountRef} style={{ width: '100%', height: 480 }} />

      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
        {loaded.map((c, i) => (
          <div key={c.name} style={{ padding: 8, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6 }}>
            <div style={{ fontWeight: 700 }}>{c.name}</div>
            <div style={{ marginTop: 6 }}>
              <button onClick={() => playAnimation(i, 'idle')}>Idle</button>
              <button onClick={() => playAnimation(i, 'walk')}>Walk</button>
              <button onClick={() => playAnimation(i, 'run')}>Run</button>
              <button onClick={() => playAnimation(i, 'attack')}>Attack</button>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: '#444' }}>Available animations:</div>
              <ul>
                {((c.gltf as any)?.animations ?? []).map((a: any) => (
                  <li key={a.name}>{a.name}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Note:</strong> Run node scripts/download-assets.js first to populate public/assets/characters/ with the GLB files named in assets-manifest.json.
      </div>
    </div>
  );
}

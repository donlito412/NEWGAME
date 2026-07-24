import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function CharacterDemo() {
  const mountRef = useRef(null);
  const [loaded, setLoaded] = useState([]);
  const mixersRef = useRef([]);

  const CHARACTER_PATHS = [
    { name: 'Fox', path: '/assets/characters/Fox.glb' },
    { name: 'CesiumMan', path: '/assets/characters/CesiumMan.glb' },
    { name: 'Robot', path: '/assets/characters/robot.glb' },
  ];

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const width = mount.clientWidth || 800;
    const height = 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa8d0c6);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 1.6, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    // renderer.outputColorSpace fallback for older three.js versions
    if (renderer.outputColorSpace !== undefined) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if (renderer.gammaFactor !== undefined) {
      renderer.gammaFactor = 2.2;
      renderer.gammaOutput = true;
    }

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

    let localLoaded = [];

    function loadCharacter(info) {
      loader.load(info.path, (gltf) => {
        const group = gltf.scene;
        group.name = info.name;
        group.position.set(localLoaded.length * 1.5 - 1.5, 0, 0);
        scene.add(group);

        const mixer = new THREE.AnimationMixer(group);
        mixersRef.current.push(mixer);

        const actions = {};
        (gltf.animations || []).forEach((clip) => {
          actions[clip.name] = mixer.clipAction(clip);
        });

        if (gltf.animations && gltf.animations.length > 0) {
          const clip = gltf.animations.find((a) => /idle/i.test(a.name)) || gltf.animations[0];
          const action = mixer.clipAction(clip);
          action.play();
        }

        localLoaded.push({ name: info.name, gltf: group, mixer, actions, animations: gltf.animations || [] });
        setLoaded([...localLoaded]);
      }, undefined, (err) => {
        console.error('Failed to load', info.path, err);
      });
    }

    CHARACTER_PATHS.forEach(loadCharacter);

    const clock = new THREE.Clock();
    let stopped = false;
    function animate() {
      if (stopped) return;
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      mixersRef.current.forEach((m) => m.update(delta));
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      stopped = true;
      renderer.dispose();
      if (renderer.domElement && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  function playAnimation(characterIndex, clipName) {
    const item = loaded[characterIndex];
    if (!item || !item.gltf || !item.mixer) return;
    const animations = item.animations || [];
    if (animations.length === 0) return;
    const clip = animations.find((a) => (clipName ? a.name.toLowerCase().includes(clipName.toLowerCase()) : /idle/i.test(a.name))) || animations[0];
    const action = item.mixer.clipAction(clip);
    item.mixer.stopAllAction();
    action.reset().fadeIn(0.1).play();
  }

  return (
    React.createElement('div', null,
      React.createElement('h2', null, 'Character Demo'),
      React.createElement('div', { ref: mountRef, style: { width: '100%', height: 480 } }),

      React.createElement('div', { style: { display: 'flex', gap: 16, marginTop: 12 } },
        loaded.map((c, i) => (
          React.createElement('div', { key: c.name, style: { padding: 8, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6 } },
            React.createElement('div', { style: { fontWeight: 700 } }, c.name),
            React.createElement('div', { style: { marginTop: 6 } },
              React.createElement('button', { onClick: () => playAnimation(i, 'idle') }, 'Idle'),
              React.createElement('button', { onClick: () => playAnimation(i, 'walk'), style: { marginLeft: 6 } }, 'Walk'),
              React.createElement('button', { onClick: () => playAnimation(i, 'run'), style: { marginLeft: 6 } }, 'Run'),
              React.createElement('button', { onClick: () => playAnimation(i, 'attack'), style: { marginLeft: 6 } }, 'Attack')
            ),
            React.createElement('div', { style: { marginTop: 8 } },
              React.createElement('div', { style: { fontSize: 12, color: '#444' } }, 'Available animations:'),
              React.createElement('ul', null,
                (c.animations || []).map((a) => React.createElement('li', { key: a.name }, a.name))
              )
            )
          )
        ))
      ),

      React.createElement('div', { style: { marginTop: 12 } },
        React.createElement('strong', null, 'Note:'), ' Run node scripts/download-assets.js first to populate public/assets/characters/ with the GLB files named in assets-manifest.json.'
      )
    )
  );
}

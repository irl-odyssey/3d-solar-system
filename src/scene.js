import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { bodies } from './data.js';

function wave(x, y, z) {
  return Math.sin(x * 2.1 + Math.cos(z * 3.2)) * Math.cos(y * 3.7 + z)
    + 0.35 * Math.sin(x * 8.1 + y * 4.3) * Math.cos(z * 6.4 - y)
    + 0.14 * Math.sin(z * 19.2 + x * 13.7);
}

function surfaceTexture(body) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('A 2D context is required for procedural planet textures.');
  const image = context.createImageData(canvas.width, canvas.height);
  const base = new THREE.Color(body.color);
  const color = new THREE.Color();
  for (let y = 0; y < canvas.height; y++) {
    const latitude = (y / canvas.height) * Math.PI;
    for (let x = 0; x < canvas.width; x++) {
      const longitude = (x / canvas.width) * Math.PI * 2;
      const nx = Math.sin(latitude) * Math.cos(longitude);
      const ny = Math.cos(latitude);
      const nz = Math.sin(latitude) * Math.sin(longitude);
      const noise = wave(nx * 2, ny * 2, nz * 2);
      color.copy(base);
      if (body.surface === 'earth') {
        color.set(noise > 0.1 ? '#789d77' : '#275b91');
        if (Math.abs(ny) > 0.93 || wave(nx * 5 + 2, ny * 4, nz * 5) > 1.03) color.set('#d6e5e9');
      } else if (body.surface === 'gas') {
        const band = Math.sin(latitude * 38 + noise * 0.8) * 0.14 + Math.sin(latitude * 67) * 0.05;
        color.multiplyScalar(0.82 + band);
      } else {
        color.multiplyScalar(0.85 + noise * (body.surface === 'cloudy' ? 0.06 : 0.16));
      }
      color.convertLinearToSRGB();
      const offset = (y * canvas.width + x) * 4;
      image.data[offset] = Math.round(color.r * 255);
      image.data[offset + 1] = Math.round(color.g * 255);
      image.data[offset + 2] = Math.round(color.b * 255);
      image.data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

function glowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('A 2D context is required for the procedural sun glow.');
  const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 202, 111, 0.55)');
  gradient.addColorStop(0.3, 'rgba(248, 164, 64, 0.22)');
  gradient.addColorStop(1, 'rgba(248, 164, 64, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

export function createSolarSystem({ canvas, labelLayer, reducedMotion, onSelect, onUnavailable }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-30, 30, 30, -30, 0.1, 500);
  const controls = new OrbitControls(camera, canvas);
  const events = new AbortController();
  const observer = new ResizeObserver(resize);
  const objects = new Map();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const projected = new THREE.Vector3();
  const previousTarget = new THREE.Vector3();
  const offset = new THREE.Vector3();
  let frame = 0;
  let disposed = false;
  let time = 0;
  let previousTime;
  let speed = 1;
  let paused = reducedMotion;
  let selectedId = 'earth';
  let followingId = null;
  let pointerStart;
  let width = 1;
  let height = 1;

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    events.abort();
    controls.dispose();
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) {
        const list = Array.isArray(object.material) ? object.material : [object.material];
        list.forEach((material) => materials.add(material));
      }
    });
    materials.forEach((material) => {
      Object.values(material).forEach((value) => { if (value?.isTexture) textures.add(value); });
      material.dispose();
    });
    textures.forEach((texture) => texture.dispose());
    geometries.forEach((geometry) => geometry.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    labelLayer.replaceChildren();
  }

  function reset() {
    followingId = null;
    camera.position.set(0, 34, 43);
    camera.zoom = 1;
    controls.target.set(0, 0, 0);
    camera.updateProjectionMatrix();
    controls.update();
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const aspect = width / height;
    const span = Math.max(18, 26 / aspect);
    camera.left = -span * aspect;
    camera.right = span * aspect;
    camera.top = span;
    camera.bottom = -span;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
  }

  function animate(now) {
    if (disposed) return;
    frame = requestAnimationFrame(animate);
    const delta = previousTime === undefined ? 0 : Math.min((now - previousTime) / 1000, 0.05);
    previousTime = now;
    if (!paused && !document.hidden) time += delta * speed;
    objects.forEach(({ body, group, mesh }) => {
      const angle = body.phase + time * body.orbitSpeed;
      group.position.set(Math.cos(angle) * body.orbitRadius, 0, Math.sin(angle) * body.orbitRadius);
      if (!paused && !document.hidden) mesh.rotation.y += delta * speed * 0.09;
    });
    if (followingId) {
      previousTarget.copy(controls.target);
      controls.target.copy(objects.get(followingId).group.position);
      offset.subVectors(controls.target, previousTarget);
      camera.position.add(offset);
    }
    controls.update();
    renderer.render(scene, camera);
    objects.forEach(({ body, group, label }) => {
      projected.copy(group.position).project(camera);
      const visible = projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 0.94 && Math.abs(projected.y) < 0.92;
      label.hidden = !visible;
      if (visible) {
        label.style.transform = `translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height + 12 + body.radius * 5}px) translateX(-50%)`;
      }
    });
  }

  try {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.minZoom = 0.7;
    controls.maxZoom = 8;
    controls.minPolarAngle = Math.PI * 0.08;
    controls.maxPolarAngle = Math.PI * 0.48;
    scene.add(new THREE.AmbientLight(0xb7d2ef, 1.2));
    scene.add(new THREE.PointLight(0xffddb4, 3.5, 0, 0));
    const fill = new THREE.DirectionalLight(0xc9dfff, 1.2);
    fill.position.set(-15, 20, 10);
    scene.add(fill);

    bodies.forEach((body) => {
      const group = new THREE.Group();
      scene.add(group);
      const material = body.id === 'sun'
        ? new THREE.MeshBasicMaterial({ color: '#ffcb75' })
        : new THREE.MeshStandardMaterial({ roughness: 0.96, metalness: 0 });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(body.radius, 48, 32), material);
      group.add(mesh);
      material.map = surfaceTexture(body);
      mesh.rotation.z = body.id === 'uranus' ? Math.PI / 2 : 0.12;
      if (body.rings) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(body.radius * 1.4, body.radius * 2.15, 96),
          new THREE.MeshStandardMaterial({ color: '#b5a280', side: THREE.DoubleSide, transparent: true, opacity: 0.75 }),
        );
        ring.rotation.x = -Math.PI / 2.4;
        group.add(ring);
        const gap = new THREE.Mesh(
          new THREE.RingGeometry(body.radius * 1.79, body.radius * 1.85, 96),
          new THREE.MeshBasicMaterial({ color: '#111b2b', side: THREE.DoubleSide }),
        );
        gap.rotation.copy(ring.rotation);
        gap.position.y = 0.01;
        group.add(gap);
      }
      if (body.orbitRadius) {
        const points = Array.from({ length: 192 }, (_, index) => {
          const angle = (index / 192) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(angle) * body.orbitRadius, 0, Math.sin(angle) * body.orbitRadius);
        });
        const orbit = new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({ color: '#7185a3', transparent: true, opacity: 0.22 }),
        );
        orbit.name = `orbit-${body.id}`;
        scene.add(orbit);
      }
      const label = document.createElement('span');
      label.className = 'scene-label';
      label.textContent = body.name;
      labelLayer.append(label);
      objects.set(body.id, { body, group, mesh, label });
    });

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.set(10, 10, 1);
    scene.add(glow);

    // A deterministic, original star field keeps the composition stable on reload.
    const stars = new Float32Array(420 * 3);
    let seed = 41;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let index = 0; index < stars.length; index += 3) {
      stars[index] = (random() - 0.5) * 160;
      stars[index + 1] = -15 - random() * 50;
      stars[index + 2] = (random() - 0.5) * 160;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3));
    scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({
      color: '#9cbbd8', size: 0.095, transparent: true, opacity: 0.6, sizeAttenuation: true,
    })));

    canvas.addEventListener('pointerdown', (event) => {
      pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    }, { signal: events.signal });
    canvas.addEventListener('pointercancel', () => { pointerStart = null; }, { signal: events.signal });
    canvas.addEventListener('pointerup', (event) => {
      if (!pointerStart || pointerStart.id !== event.pointerId) return;
      const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
      pointerStart = null;
      if (distance > 5) return;
      const rect = canvas.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([...objects.values()].map(({ mesh }) => mesh), false);
      if (hits.length) {
        const match = [...objects.values()].find(({ mesh }) => mesh === hits[0].object);
        onSelect(match.body.id);
      }
    }, { signal: events.signal });
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      onUnavailable(new Error('WebGL context lost. Reload the page to retry 3D.'));
    }, { signal: events.signal });
    document.addEventListener('visibilitychange', () => { previousTime = undefined; }, { signal: events.signal });
    reset();
    resize();
    observer.observe(canvas.parentElement);
    frame = requestAnimationFrame(animate);
    return {
      select(id) {
        selectedId = id;
        if (followingId) reset();
        objects.forEach(({ body, label }) => {
          label.classList.toggle('is-selected', body.id === selectedId);
          const orbit = scene.getObjectByName(`orbit-${body.id}`);
          if (orbit) {
            orbit.material.color.set(body.id === selectedId ? '#efb968' : '#7185a3');
            orbit.material.opacity = body.id === selectedId ? 0.55 : 0.22;
          }
        });
      },
      focus(id) {
        followingId = id;
        offset.subVectors(camera.position, controls.target);
        controls.target.copy(objects.get(id).group.position);
        camera.position.copy(controls.target).add(offset);
        camera.zoom = id === 'sun' || id === 'jupiter' || id === 'saturn' ? 4 : 6;
        camera.updateProjectionMatrix();
        controls.update();
      },
      reset,
      setPaused(value) { paused = value; },
      setSpeed(value) { speed = value; },
      setReducedMotion(value) { if (value) paused = true; },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

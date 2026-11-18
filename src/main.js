import { bodies } from './data.js';
import { createSolarSystem } from './scene.js';
import './style.css';

const $ = (id) => document.getElementById(id);
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const events = new AbortController();
let selected = bodies.find((body) => body.id === 'earth');
let paused = motionPreference.matches;
let scene;

const buttons = bodies.map((body, index) => {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'planet-button';
  button.dataset.body = body.id;
  button.style.setProperty('--planet-color', body.color);
  button.innerHTML = `<span class="planet-dot" aria-hidden="true"></span><span>${body.name}</span><span class="planet-index" aria-hidden="true">${String(index).padStart(2, '0')}</span>`;
  button.addEventListener('click', () => select(body.id), { signal: events.signal });
  item.append(button);
  $('planet-list').append(item);
  return button;
});

function select(id, announce = true) {
  selected = bodies.find((body) => body.id === id);
  buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.body === id)));
  $('body-number').textContent = `${String(bodies.indexOf(selected) + 1).padStart(2, '0')} / 09`;
  $('body-kind').textContent = selected.kind;
  $('body-name').textContent = selected.name;
  $('body-description').textContent = selected.description;
  $('body-distance').textContent = selected.distance;
  $('body-year').textContent = selected.year;
  $('body-day').textContent = selected.day;
  $('focus-label').textContent = `Focus on ${selected.name}`;
  $('body-art').style.setProperty('--body-color', selected.color);
  $('body-art').dataset.surface = selected.surface;
  $('body-art').classList.toggle('has-rings', Boolean(selected.rings));
  if (announce) $('selection-status').textContent = `${selected.name}. ${selected.description}`;
  scene?.select(id);
  $('view-mode').textContent = $('fallback').hidden ? 'OVERVIEW' : 'TEXT VIEW';
}

function updateMotion() {
  $('toggle-motion').setAttribute('aria-pressed', String(paused));
  $('motion-label').textContent = paused ? 'Resume orbits' : 'Pause orbits';
  $('motion-symbol').textContent = paused ? '▶' : 'Ⅱ';
  if ($('fallback').hidden) $('motion-status').textContent = paused ? 'PAUSED' : 'IN MOTION';
  scene?.setPaused(paused);
}

function showFallback(error) {
  console.error('The 3D observatory is unavailable:', error);
  scene?.dispose();
  scene = undefined;
  $('solar-canvas').hidden = true;
  $('planet-labels').hidden = true;
  $('fallback').hidden = false;
  $('fallback-reason').textContent = '3D rendering is unavailable in this browser or the graphics context was lost. Reload to retry 3D.';
  $('scene-hint').textContent = 'TEXT FIELD GUIDE';
  $('view-mode').textContent = 'TEXT VIEW';
  $('motion-status').textContent = '3D UNAVAILABLE';
  ['toggle-motion', 'orbit-speed', 'focus-body', 'reset-view'].forEach((id) => { $(id).disabled = true; });
}

select(selected.id, false);
updateMotion();

try {
  scene = createSolarSystem({
    canvas: $('solar-canvas'),
    labelLayer: $('planet-labels'),
    reducedMotion: motionPreference.matches,
    onSelect: select,
    onUnavailable: showFallback,
  });
  scene.select(selected.id);
  scene.setPaused(paused);
} catch (error) {
  showFallback(error);
}

$('toggle-motion').addEventListener('click', () => {
  paused = !paused;
  updateMotion();
}, { signal: events.signal });
$('orbit-speed').addEventListener('change', (event) => {
  scene?.setSpeed(Number(event.target.value));
}, { signal: events.signal });
$('focus-body').addEventListener('click', () => {
  scene?.focus(selected.id);
  $('view-mode').textContent = `FOLLOWING ${selected.name.toUpperCase()}`;
  $('scene-container').scrollIntoView({ block: 'nearest' });
}, { signal: events.signal });
$('reset-view').addEventListener('click', () => {
  scene?.reset();
  $('view-mode').textContent = 'OVERVIEW';
}, { signal: events.signal });
motionPreference.addEventListener('change', () => {
  scene?.setReducedMotion(motionPreference.matches);
  if (motionPreference.matches) {
    paused = true;
    updateMotion();
  }
}, { signal: events.signal });

export function dispose() {
  events.abort();
  scene?.dispose();
  scene = undefined;
  buttons.forEach((button) => button.parentElement?.remove());
}

// Keep back/forward-cache restores usable; a normal page exit releases GPU resources.
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) dispose();
}, { signal: events.signal });
if (import.meta.hot) import.meta.hot.dispose(dispose);

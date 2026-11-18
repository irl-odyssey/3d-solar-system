# Orbital: a solar system field guide

A standalone, original Three.js observatory for a Copilot App Projects multi-repository workshop. Vanilla JavaScript ES modules, Vite, procedural planets and a navy/amber visual identity. No frameworks, remote assets, accounts or APIs.

## Run

Use Node.js 22.12+ (22.x) or 24+. From this directory:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Production build and local preview:

```sh
npm run build
npm run preview
```

Stop either server with Ctrl+C. Dependencies are pinned in `package-lock.json`; build output is `dist/`.

## Explore

- Select the Sun or any of the eight planets using the HTML list (Tab, then Enter/Space), or click a planet in the scene. The panel shows a short description and facts.
- **Focus on ...** follows the selected body. **Reset view** returns to the overview.
- Drag to orbit the camera; scroll or pinch to zoom. All essential selection and focus controls are HTML buttons, independent of canvas interaction.
- Pause/resume orbits and choose 0.25x, 1x or 3x speed. Reduced-motion preferences start the scene paused, including when enabled while the page is open. Motion resumes only on explicit request.
- If WebGL cannot initialize or its context is lost, a text field guide and the complete planet list remain usable. Reload to retry 3D.

**Sizes, distances and animation rates are illustrative, not a physical simulation.** Facts are rounded; AU means the average Earth-Sun distance. Rotation periods describe a spin relative to the stars, not necessarily a sunrise-to-sunrise day; the Sun rotates at different rates with latitude. Procedural surfaces are illustrations, not spacecraft imagery.

## Small file map

| File | Responsibility |
| --- | --- |
| `index.html` | Semantic page shell, navigation, controls and fact panel |
| `src/data.js` | The single astronomy dataset |
| `src/scene.js` | Three.js scene, procedural surfaces, picking, orbit/focus behavior and GPU cleanup |
| `src/main.js` | HTML list, selection, motion preferences, fallback and lifecycle |
| `src/style.css` | Responsive navy/amber observatory styling |

Each data entry has `id`, `name`, `kind`, `radius`, `orbitRadius`, `color`, `surface`, `orbitSpeed`, `phase`, `description`, `distance`, `year` and `day`; Saturn also has `rings: true`. `radius` and `orbitRadius` are scene units; `orbitSpeed` is radians per animation second at 1x; `phase` is the starting angle in radians. The Sun has zero orbit radius/speed. Display facts are strings, independent of animation values. There are deliberately no article paths or website categories.

`createSolarSystem({ canvas, labelLayer, reducedMotion, onSelect, onUnavailable })` returns `select(id)`, `focus(id)`, `reset()`, `setPaused(boolean)`, `setSpeed(number)`, `setReducedMotion(boolean)` and `dispose()`. `onSelect` receives a body ID. Call `dispose()` when unmounting: it cancels animation, removes controls/events/observers, and releases geometry, materials, textures and the renderer. The standalone app also handles hot reload and page exit. An Astro integration must connect disposal to its own route/component lifecycle.

## Workshop: adapt, do not paste

This is the **source app**, not the completed Playbook integration. Its astronomy schema, fact panels and visual language intentionally differ from the retro Astro Playbook:

1. Inspect both repositories. Map astronomy entries to the Playbook's **existing** categories and article routes; do not invent URLs or copy these planet names into the final navigation.
2. Keep the existing 2D experience and site navigation intact. Adapt the scene as an additional view, with an accessible non-canvas path and reduced-motion support.
3. Restyle the observatory to the site's existing green retro design. Scope styles and replace standalone document IDs/layout assumptions as appropriate.
4. Inspect the selected checkpoint first. If **checkpoint3** already provides 3D, improve or reuse it instead of creating a duplicate 3D view.

The scene/data separation is the starting point for that reasoning, not a drop-in integration contract.

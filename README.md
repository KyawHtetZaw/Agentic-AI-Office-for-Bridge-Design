# AGENTIC AI OFFICE FOR BOX GIRDER BRIDGE DESIGN

A cozy, purely fictional 3D office game built with React, TypeScript, Three.js, React Three Fiber, and Drei. It is **not** a structural engineering tool. Every project, dimension, score, check, and cost is made-up game data. There are no real engineering calculations, code-compliance claims, AI APIs, or backend services.

The original miniature office, camera controls, characters, furniture, and bridge models remain in the expanded world. The team now has connected structural, sustainability, cost and decision, meeting, and CEO spaces, plus corridors, a pantry, toilets, parking, gardens, cars, and small animals.

## Run

With Node.js 22+ installed:

```sh
npm install
npm run dev
```

Run `npm run build` for a static production build in `dist`.

## Play

- Drag to rotate, scroll or pinch to zoom, and right-drag to pan. Click a department button or in-scene sign to focus its room. Click any character or the bridge model to focus it.
- Atlas, Beam, Check, Eco, Cash, and Rank move a fictional project through the existing workflow. Check may send Beam's concept back for a playful revision. Rank eventually asks you to pick a favorite game alternative in **NEEDS YOU**.
- Eco coordinates Carbon, Durability, Maintain, and Environment. The four specialists work simultaneously on independent, fictional ratings, walk their reports to Eco, and Eco combines their game scores.
- Click a person or team card to inspect their status, task, progress, and thought. You can view a task, focus the camera, or send a worker on a coffee break.
- Click Kyaw to visit the CEO panel. Send him to play a game, visit the team, call a meeting, scold an employee, walk outside, or return to his office. He may do these things on his own too.
- People may take short breaks, visit the toilets, tend the plants, study models, nap, or chat. Toilets briefly hide the visitor from the scene; their status remains visible in the team list.
- Space pauses or resumes; H resets the camera; Escape closes overlays and resets the view. Playback speed controls change simulation pace. The people button toggles name labels.
- **PROJECTS** keeps the current project and up to 20 completed fictional projects for this browser session. **DESIGN BOARD** shows delivered game outputs. Refreshing starts a fresh session.

## Architecture

- `src/simulation/model.ts` defines typed agents, game states, projects, departments, outputs, and actions.
- `src/simulation/behavior.ts` provides room destinations and simple obstacle-aware routes across the connected office.
- `src/simulation/engine.ts` is a seeded, deterministic game state machine for workflow handoffs, four concurrent specialists, CEO events, breaks, and random office life. It has no React, Three.js, browser, network, or engineering dependencies.
- `src/simulation/useSimulation.ts` adapts the game clock to React and supports pausing and speed controls.
- `src/App.tsx` retains the original office and procedural character scene, while `src/WorldExpansion.tsx` adds the connected rooms and outdoor diorama. `src/WorkflowPanel.tsx` presents game tasks and fictional results.

Geometry is sampled from arbitrary predefined ranges. Reviews, sustainability ratings, and costs are arcade values. Rank blends game scores with small random variations; this is not engineering optimization. Decorative 3D bridge models do not represent the sampled project values.

## Verify

```sh
node --experimental-strip-types --test tests/simulation.test.ts
npm run build
```

The tests cover seeded workflows, revisions, handoffs, breaks, project history, game-data bounds, route finding, parallel sustainability workers, toilet visits, CEO commands, and deterministic transitions. Node.js 22.6+ is needed for direct TypeScript test execution. A WebGL-capable browser is required to view the 3D scene.

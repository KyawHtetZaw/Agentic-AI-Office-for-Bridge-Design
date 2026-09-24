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
- Atlas, Beam, Check, Eco, Cash, and Rank move a fictional project through the existing workflow. Beam samples three toy alternatives, and Beam and Check visit the bridge model together. Check may ask you for a revision decision in **NEEDS YOU**.
- Eco coordinates Carbon, Durability, Maintain, and Environment. The four specialists work simultaneously on independent, fictional ratings, walk their reports to Eco, and Eco combines their game scores.
- Click a person or team card to inspect their status, task, progress, and thought. You can view a task, focus the camera, or send a worker on a coffee break.
- Eco asks you for a playful preference between two fictional tradeoffs. Rank later asks you to pick a favorite game alternative. The project then reaches Kyaw's CEO review, where you can approve, reject, call a meeting, nap, or delay it. Approval triggers confetti and a late CEO entrance.
- Click Kyaw to visit the CEO panel. Send him to play a game, visit the team, call a meeting, scold an employee, walk outside, or return to his office. He may do these things on his own too. The CEO dashboard tracks company game statistics and silly achievements.
- People may take short breaks, visit the toilets, tend the plants, study models, nap, or chat. Toilets briefly hide the visitor from the scene; their status remains visible in the team list.
- Space pauses or resumes; H resets the camera; Escape closes overlays and resets the view. Playback speed controls change simulation pace. The people button toggles name labels.
- **PROJECTS** shows cards for the current project and up to 20 completed projects, each with a dashboard for project information, three structural concepts, four sustainability specialists, fictional costs, rankings, and recent activity. **DESIGN BOARD** is a nine-column Kanban view. **TEAM** shows the complete organization and individual tasks. Refreshing starts a fresh session.

## Architecture

- `src/simulation/model.ts` defines typed agents, game states, projects, departments, outputs, and actions.
- `src/simulation/behavior.ts` provides room destinations and simple obstacle-aware routes across the connected office.
- `src/simulation/engine.ts` is a seeded, deterministic game state machine for workflow handoffs, four concurrent specialists, CEO events, breaks, and random office life. It has no React, Three.js, browser, network, or engineering dependencies.
- `src/simulation/management.ts` derives board columns, assigned people, department labels, and game progress from the project state.
- `src/simulation/useSimulation.ts` adapts the game clock to React and supports pausing and speed controls.
- `src/App.tsx` retains the original office and procedural character scene, while `src/WorldExpansion.tsx` adds the connected rooms and outdoor diorama. The little bridge model changes visible proportions with fictional project data. `src/WorkflowPanel.tsx` and `src/ManagementViews.tsx` present decisions, dashboards, cards, and results.

Geometry is sampled from arbitrary predefined ranges. Reviews, sustainability ratings, and costs are arcade values. Rank averages six unrelated game scores with random variations; this is not engineering optimization. Decorative 3D bridge models use game values only to change their appearance and do not represent an engineering design.

## Verify

```sh
node --experimental-strip-types --test tests/simulation.test.ts
npm run build
```

The tests cover seeded workflows, game decisions, CEO rejection and approval, revisions, handoffs, breaks, project history, game-data bounds, route finding, parallel sustainability workers, toilet visits, CEO commands, and deterministic transitions. Node.js 22.6+ is needed for direct TypeScript test execution. A WebGL-capable browser is required to view the 3D scene.

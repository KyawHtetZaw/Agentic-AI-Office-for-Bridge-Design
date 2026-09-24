# BRIDGE AI LAB

A purely fictional, cozy 3D office simulation built with React, TypeScript, Three.js, React Three Fiber, and Drei. No AI APIs, backend, structural calculations, code compliance, or real engineering verification. The original office, camera, furniture, and bridge models are preserved.

## Run

Install Node.js 22+ and run:

```sh
npm install
npm run dev
```

Production build: `npm run build`. Serve the `dist` directory with any static web host.

## Play

- Drag to orbit, scroll/pinch to zoom, right-drag to pan.
- Click an employee or team card to see their state, current task, project, progress, and thought. View their task, focus the camera, or send them for a coffee break.
- Click the bridge model or the project arrow to inspect it.
- Space pauses/resumes; H resets the camera; Escape closes overlays and resets the view.
- Speed controls change the routine pace. The people button toggles name labels.
- The six agents pass projects through Atlas → Beam → Check → Eco → Cash → Rank. Watch their physical handoffs and speech bubbles.
- Check sometimes returns a concept to Beam for revision; after at most two revisions the fictional workflow advances.
- Rank calls for you in **NEEDS YOU**. Pick a favorite alternative to complete the project and trigger a team celebration.
- **PROJECTS** keeps the current project and up to 20 completed projects for this browser session. Start another project after completing the current one. **DESIGN BOARD** shows all delivered fictional outputs. **TEAM** shows all six employees.
- Breaks save progress and resume automatically after ten game seconds at the coffee machine. You can also choose **RETURN TO TASK**. Pausing freezes simulation timers and character animation; camera controls remain available.
- Everything is session-only; refreshing starts a fresh lab.

## Simulation architecture

- `src/simulation/model.ts`: typed agents, roles, states, projects, outputs, and actions.
- `src/simulation/behavior.ts`: office navigation around furniture and behavior destinations.
- `src/simulation/engine.ts`: pure, seeded state machine; workflow, handoffs, random events, revisions, and breaks. It has no React, Three.js, browser, network, or engineering dependencies.
- `src/simulation/useSimulation.ts`: pausable, speed-adjusted clock and React adapter.
- `src/WorkflowPanel.tsx`: task panels, project history, result cards, and favorite selection.
- `src/App.tsx`: the existing office and procedural characters, now rendering engine snapshots.

Geometry is sampled from arbitrary predefined ranges. Reviews, sustainability ratings, and costs are made-up game values. Rank averages three arcade scores, with small random variations for alternatives; this is not engineering optimization. The original 3D bridge model remains a decorative prop and does not represent project geometry.

## Verify

```sh
node --experimental-strip-types --test tests/simulation.test.ts
npm run build
```

The tests cover seeded full workflows, revision loops, breaks during work and handoffs, project history/reset, bounded game data, and immutable deterministic transitions. Use Node.js 22.6+ for TypeScript test execution.

All geometry and animations are procedural. Google Fonts are optional; system sans-serif fallbacks work offline. Requires a WebGL-capable browser with hardware acceleration.

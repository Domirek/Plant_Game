# Focus Garden 🌱

A cozy 3D productivity game where you grow plants while you focus, and decorate your garden with items from the shop. Built with **Three.js** and **Vite**.

## How it works

1. **Set a focus session** — choose a plant type, duration, and task description
2. **Click a garden bed** to start — the plant grows as time passes (3 stages: small → medium → large)
3. **Complete the session** to earn 🪙 coins
4. **Spend coins in the Shop** (🏪 button) to buy 3D decor items — they appear automatically in fixed positions around the garden
5. **Pet the cat** 🐱 wandering around for bonus coins
6. **Complete achievements and daily quests** for extra rewards

## Features

- 5 plant types with 3 growth stages each (GLTF models)
- 22 shop decor items (fountains, lanterns, benches, playground sets, picnic sets)
- Cat with AI wandering and petting interaction
- 6 garden beds for concurrent focus sessions
- 12 fixed decor slots around the garden
- Achievement system (9 achievements)
- Daily quest system (3 random quests per day)
- OrbitControls camera (rotate/zoom)
- Coins economy with notifications

## Tech Stack

- **Three.js** (^0.170.0) — 3D rendering engine
- **Vite** (^6.0.0) — dev server and bundler
- **JavaScript** (ES Modules)
- **GLTF/FBX** — 3D models

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── main.js           # Entry point, game loop
├── scene.js          # Three.js scene, camera, renderer, lighting
├── environment.js    # Garden beds, decor placement, forest border
├── game.js           # Game state, coins, sessions, achievements, quests
├── shop.js           # Shop items data + buyItem() purchase logic
├── ui.js             # HUD, shop panel, notifications, labels
├── interactions.js   # Raycasting, click handling for beds/cat/decor
├── plants.js         # Plant types, growth stages, GLTF loading
└── cat.js            # Cat FBX model, wandering AI, petting

public/assets/
├── house/            # House, trees, mailbox, bench models
├── plants/           # Plant GLTF models (5 types × 3 stages)
├── shop/             # Shop decor models (3 sets)
└── cat/              # Cat FBX model
```

## Shop

The shop sells 22 decor items from 3 themed sets:

| Set | Items | Price Range |
|-----|-------|-------------|
| Pretty Park | Fountain, Lantern, Bench, Bird, Flowers, Bushes, Trash Can | 15–75 🪙 |
| Fun Playground | Merry-Go-Round, Monkey Bars, Seesaw, Sandbox, Picnic Table, Cart, Spring Horse, Sandcastle, Bucket | 10–100 🪙 |
| Pleasant Picnic | Cooler, Radio, Picnic Basket, Grapes Bowl | 15–30 🪙 |

Each item is a GLTF 3D model placed at a fixed position around the garden beds.

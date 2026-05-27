import { initScene, getScene, getRenderer, getControls } from './scene.js'
import { loadEnvironment, isEnvironmentLoaded } from './environment.js'
import { setupInteraction } from './interactions.js'
import { updateUI } from './ui.js'
import { updateGame } from './game.js'

const canvas = document.getElementById('game-canvas')
const { scene, camera, renderer, controls } = initScene(canvas)

setupInteraction(canvas)

let envReady = false

// Load environment then show UI
loadEnvironment().then(() => {
  envReady = true
  updateUI()
})

let lastTime = 0

function gameLoop(time) {
  requestAnimationFrame(gameLoop)

  const delta = Math.min((time - lastTime) / 1000, 0.05)
  lastTime = time

  if (envReady) {
    updateGame(delta)
  }

  controls.update()
  renderer.render(scene, camera)
}

gameLoop(0)

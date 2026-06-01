import { initScene } from './scene.js'
import { loadEnvironment } from './environment.js'
import { setupInteraction } from './interactions.js'
import { updateUI, setupUI } from './ui.js'
import { updateGame } from './game.js'
import { loadCat, updateCat } from './cat.js'

const canvas = document.getElementById('game-canvas')
const { scene, camera, renderer, controls } = initScene(canvas)

setupInteraction(canvas)

let envReady = false

loadEnvironment().then(() => {
  envReady = true
  setupUI()
  loadCat()
})

let lastTime = 0

function gameLoop(time) {
  requestAnimationFrame(gameLoop)

  const delta = Math.min((time - lastTime) / 1000, 0.05)
  lastTime = time

  if (envReady) {
    updateGame(delta)
    updateCat(delta)
    updateUI()
  }

  controls.update()
  renderer.render(scene, camera)
}

gameLoop(0)

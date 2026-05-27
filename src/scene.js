import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let scene, camera, renderer, controls

export function initScene(canvas) {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87CEEB)
  scene.fog = new THREE.Fog(0x87CEEB, 25, 50)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(12, 10, 12)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  controls = new OrbitControls(camera, renderer.domElement)
  controls.maxPolarAngle = Math.PI / 2.3
  controls.minDistance = 5
  controls.maxDistance = 25
  controls.target.set(0, 0, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.update()

  setupLighting()
  createGround()
  handleResize()

  return { scene, camera, renderer, controls }
}

function setupLighting() {
  const ambient = new THREE.AmbientLight(0x8899aa, 0.5)
  scene.add(ambient)

  const sun = new THREE.DirectionalLight(0xffeedd, 1.8)
  sun.position.set(10, 15, 8)
  sun.castShadow = true
  sun.shadow.mapSize.width = 2048
  sun.shadow.mapSize.height = 2048
  sun.shadow.camera.near = 0.5
  sun.shadow.camera.far = 35
  sun.shadow.camera.left = -15
  sun.shadow.camera.right = 15
  sun.shadow.camera.top = 15
  sun.shadow.camera.bottom = -15
  scene.add(sun)

  const fill = new THREE.DirectionalLight(0x8888ff, 0.4)
  fill.position.set(-5, 5, -8)
  scene.add(fill)

  const hemi = new THREE.HemisphereLight(0x87CEEB, 0x4a7a3a, 0.6)
  scene.add(hemi)
}

function createGround() {
  const geo = new THREE.PlaneGeometry(30, 30)
  const mat = new THREE.MeshStandardMaterial({
    color: 0x8cb87a,
    roughness: 0.9,
    metalness: 0
  })
  const ground = new THREE.Mesh(geo, mat)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
}

function handleResize() {
  window.addEventListener('resize', () => {
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })
}

export function getScene() { return scene }
export function getCamera() { return camera }
export function getRenderer() { return renderer }
export function getControls() { return controls }

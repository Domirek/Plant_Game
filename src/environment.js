import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getScene } from './scene.js'

const loader = new GLTFLoader()
const scene = getScene

const GARDEN_POSITIONS = [
  { x: -2.5, z: -1.5 },
  { x: 0, z: -1.5 },
  { x: 2.5, z: -1.5 },
  { x: -2.5, z: 1.5 },
  { x: 0, z: 1.5 },
  { x: 2.5, z: 1.5 },
]

let gardenBeds = []
let environmentLoaded = false

export function loadEnvironment() {
  return new Promise((resolve) => {
    const s = scene()
    
    // flag to track when all models are loaded
    const totalModels = 4
    let loaded = 0
    const onLoaded = () => { loaded++; if (loaded >= totalModels) { environmentLoaded = true; resolve() } }

    // House
    loader.load('/assets/house/Assets/gltf/house.gltf', (gltf) => {
      const house = gltf.scene
      house.position.set(0, 0, -4.5)
      house.scale.set(0.8, 0.8, 0.8)
      house.traverse(c => { c.castShadow = true; c.receiveShadow = true })
      s.add(house)
      onLoaded()
    })

    // Tree large
    loader.load('/assets/house/Assets/gltf/tree_large.gltf', (gltf) => {
      const tree = gltf.scene
      tree.position.set(5, 0, -3)
      tree.scale.set(0.7, 0.7, 0.7)
      tree.traverse(c => { c.castShadow = true; c.receiveShadow = true })
      s.add(tree)
      onLoaded()
    })

    // Mailbox
    loader.load('/assets/house/Assets/gltf/mailbox.gltf', (gltf) => {
      const mb = gltf.scene
      mb.position.set(3.5, 0, -4)
      mb.scale.set(0.6, 0.6, 0.6)
      mb.traverse(c => { c.castShadow = true; c.receiveShadow = true })
      s.add(mb)
      onLoaded()
    })

    // Bench
    loader.load('/assets/house/Assets/gltf/bench_A.gltf', (gltf) => {
      const bench = gltf.scene
      bench.position.set(-3.5, 0, -4)
      bench.scale.set(0.6, 0.6, 0.6)
      bench.traverse(c => { c.castShadow = true; c.receiveShadow = true })
      s.add(bench)
      onLoaded()
    })

    // Garden beds
    createGardenBeds()
  })
}

function createGardenBeds() {
  const s = scene()
  const bedMat = new THREE.MeshStandardMaterial({ color: 0x6b4e2e, roughness: 0.9 })
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 1 })
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x8b6b47, roughness: 0.8 })

  GARDEN_POSITIONS.forEach((pos, i) => {
    const group = new THREE.Group()
    group.position.set(pos.x, 0, pos.z)

    // Wooden rim
    const rimGeo = new THREE.BoxGeometry(1.1, 0.1, 1.1)
    const rim = new THREE.Mesh(rimGeo, rimMat)
    rim.position.y = 0.05
    rim.receiveShadow = true
    rim.castShadow = true
    group.add(rim)

    // Soil
    const soilGeo = new THREE.BoxGeometry(0.9, 0.08, 0.9)
    const soil = new THREE.Mesh(soilGeo, soilMat)
    soil.position.y = 0.04
    soil.receiveShadow = true
    group.add(soil)

    // Side walls
    const sideMat = new THREE.MeshStandardMaterial({ color: 0x7a5c3a, roughness: 0.85 })
    const makeSide = (w, h, d, x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), sideMat)
      m.position.set(x, y, z)
      m.castShadow = true
      m.receiveShadow = true
      group.add(m)
    }
    makeSide(1.2, 0.15, 0.08, 0, 0.075, 0.56)
    makeSide(1.2, 0.15, 0.08, 0, 0.075, -0.56)
    makeSide(0.08, 0.15, 1.2, 0.56, 0.075, 0)
    makeSide(0.08, 0.15, 1.2, -0.56, 0.075, 0)

    s.add(group)

    gardenBeds.push({
      index: i,
      group,
      planted: false,
      plantType: null,
      stage: 0,
      waterLevel: 0,
      mesh: null,
      growthTimer: 0,
      mature: false
    })
  })
}

export function getGardenBeds() { return gardenBeds }

export function getGardenBedAt(position) {
  const eps = 0.8
  for (const bed of gardenBeds) {
    const dx = bed.group.position.x - position.x
    const dz = bed.group.position.z - position.z
    if (Math.abs(dx) < eps && Math.abs(dz) < eps) return bed
  }
  return null
}

export function isEnvironmentLoaded() { return environmentLoaded }

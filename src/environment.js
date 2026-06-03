import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getScene } from './scene.js'
import { asset } from './paths.js'

const loader = new GLTFLoader()
const scene = getScene

const MODELS_DIR = asset('/assets/house/Assets/gltf/')

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
let placedDecor = []

const DECOR_POSITIONS = [
  { x: -4.5, z: -3 },
  { x: 4.5, z: -3 },
  { x: -4.5, z: 3 },
  { x: 4.5, z: 3 },
  { x: -4.5, z: 0 },
  { x: 4.5, z: 0 },
  { x: 0, z: -4.5 },
  { x: 0, z: 4.5 },
  { x: -2.5, z: -4.5 },
  { x: 2.5, z: -4.5 },
  { x: -2.5, z: 4.5 },
  { x: 2.5, z: 4.5 },
]

const p = (file) => asset('/assets/house/Assets/gltf/' + file)
const FOREST_OBJECTS = [
  // Large trees around the perimeter
  { path: p('tree_large.gltf'), x: -8.5, z: -5, scale: 0.6 },
  { path: p('tree_large.gltf'), x: -10, z: 0, scale: 0.65 },
  { path: p('tree_large.gltf'), x: 8.5, z: -5, scale: 0.6 },
  { path: p('tree_large.gltf'), x: 10, z: 0, scale: 0.65 },
  { path: p('tree_large.gltf'), x: -7, z: 7, scale: 0.55 },
  { path: p('tree_large.gltf'), x: 7, z: 7, scale: 0.55 },
  { path: p('tree_large.gltf'), x: 0, z: -12, scale: 0.7 },
  { path: p('tree_large.gltf'), x: -6, z: -11, scale: 0.6 },
  { path: p('tree_large.gltf'), x: 6, z: -11, scale: 0.6 },
  // Smaller trees
  { path: p('tree.gltf'), x: -6, z: -4, scale: 0.6 },
  { path: p('tree.gltf'), x: 6, z: -4, scale: 0.6 },
  { path: p('tree.gltf'), x: -9, z: 4, scale: 0.55 },
  { path: p('tree.gltf'), x: 9, z: 4, scale: 0.55 },
  { path: p('tree.gltf'), x: -3, z: 8.5, scale: 0.5 },
  { path: p('tree.gltf'), x: 3, z: 8.5, scale: 0.5 },
  { path: p('tree.gltf'), x: -8.5, z: -9, scale: 0.55 },
  { path: p('tree.gltf'), x: 8.5, z: -9, scale: 0.55 },
  // Foliage bushes
  { path: p('foliage_A.gltf'), x: -7.5, z: -2, scale: 0.5 },
  { path: p('foliage_A.gltf'), x: 7.5, z: -2, scale: 0.5 },
  { path: p('foliage_A.gltf'), x: -4, z: -10, scale: 0.45 },
  { path: p('foliage_A.gltf'), x: 4, z: -10, scale: 0.45 },
  { path: p('foliage_A.gltf'), x: -2, z: 7, scale: 0.4 },
  { path: p('foliage_A.gltf'), x: 2, z: 7, scale: 0.4 },
  { path: p('foliage_A.gltf'), x: -8, z: 6, scale: 0.45 },
  { path: p('foliage_A.gltf'), x: 8, z: 6, scale: 0.45 },
  { path: p('foliage_B.gltf'), x: -9, z: -7.5, scale: 0.5 },
  { path: p('foliage_B.gltf'), x: 9, z: -7.5, scale: 0.5 },
  { path: p('foliage_B.gltf'), x: -5, z: 9, scale: 0.45 },
  { path: p('foliage_B.gltf'), x: 5, z: 9, scale: 0.45 },
  { path: p('foliage_B.gltf'), x: -11, z: -3, scale: 0.5 },
  { path: p('foliage_B.gltf'), x: 11, z: -3, scale: 0.5 },
]

export function loadEnvironment() {
  return new Promise((resolve) => {
    const s = scene()

    const totalModels = 4 + FOREST_OBJECTS.length
    let loaded = 0
    const onLoaded = () => { loaded++; if (loaded >= totalModels) { environmentLoaded = true; resolve() } }
    const onError = (path) => (err) => {
      console.warn('Failed to load model:', path, err)
      onLoaded()
    }

    // House
    loader.load(asset('/assets/house/Assets/gltf/house.gltf'), (gltf) => {
      const house = gltf.scene
      house.position.set(0, 0, -8)
      house.scale.set(0.8, 0.8, 0.8)
      house.traverse(c => { c.castShadow = true; c.receiveShadow = true })
      s.add(house)
      onLoaded()
    }, undefined, onError('/assets/house/Assets/gltf/house.gltf'))

    // Tree large (front yard)
    loader.load(asset('/assets/house/Assets/gltf/tree_large.gltf'), (gltf) => {
      const tree = gltf.scene
      tree.position.set(5, 0, -6)
      tree.scale.set(0.7, 0.7, 0.7)
      tree.traverse(c => { c.castShadow = true; c.receiveShadow = true })
      s.add(tree)
      onLoaded()
    }, undefined, onError('/assets/house/Assets/gltf/tree_large.gltf'))

    // Mailbox
    loader.load(asset('/assets/house/Assets/gltf/mailbox.gltf'), (gltf) => {
      const mb = gltf.scene
      mb.position.set(3.5, 0, -7)
      mb.scale.set(0.6, 0.6, 0.6)
      mb.traverse(c => { c.castShadow = true; c.receiveShadow = true })
      s.add(mb)
      onLoaded()
    }, undefined, onError('/assets/house/Assets/gltf/mailbox.gltf'))

    // Bench
    loader.load(asset('/assets/house/Assets/gltf/bench_A.gltf'), (gltf) => {
      const bench = gltf.scene
      bench.position.set(-3.5, 0, -7)
      bench.scale.set(0.6, 0.6, 0.6)
      bench.traverse(c => { c.castShadow = true; c.receiveShadow = true })
      s.add(bench)
      onLoaded()
    }, undefined, onError('/assets/house/Assets/gltf/bench_A.gltf'))

    // Forest border
    for (const obj of FOREST_OBJECTS) {
      loader.load(obj.path, (gltf) => {
        const model = gltf.scene
        model.position.set(obj.x, 0, obj.z)
        model.scale.set(obj.scale, obj.scale, obj.scale)
        const angle = Math.random() * Math.PI * 2
        model.rotation.y = angle
        model.traverse(c => { c.castShadow = true; c.receiveShadow = true })
        s.add(model)
        onLoaded()
      }, undefined, onError(obj.path))
    }

    // Garden beds
    createGardenBeds()

    // Safety timeout: resolve after 15s even if some models fail
    setTimeout(() => {
      if (!environmentLoaded) {
        console.warn('Environment load timeout — resolving with partial models')
        environmentLoaded = true
        resolve()
      }
    }, 15000)
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

const decorModelCache = new Map()

export function placeDecor(item) {
  const s = scene()
  const freeIndex = DECOR_POSITIONS.findIndex((_, i) => !placedDecor.some(d => d.index === i))
  if (freeIndex === -1) return null

  const pos = DECOR_POSITIONS[freeIndex]
  const group = new THREE.Group()
  group.position.set(pos.x, 0, pos.z)
  group.userData.isDecor = true
  group.userData.decorIndex = freeIndex
  s.add(group)

  // Placeholder while model loads
  const placeholder = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x7ba05b, emissive: 0x3a6a1a, emissiveIntensity: 0.3 })
  )
  placeholder.position.y = 0.15
  group.add(placeholder)

  loader.load(item.path, (gltf) => {
    group.remove(placeholder)
    const mesh = gltf.scene
    mesh.scale.set(item.scale, item.scale, item.scale)
    mesh.position.y = 0
    const angle = Math.random() * Math.PI * 2
    mesh.rotation.y = angle
    mesh.traverse(c => { c.castShadow = true; c.receiveShadow = true })
    group.add(mesh)
  }, undefined, (err) => {
    console.error('Failed to load decor:', item.path, err)
  })

  const entry = { index: freeIndex, group, itemId: item.id }
  placedDecor.push(entry)
  return entry
}

export function removeDecor(index) {
  const entry = placedDecor.find(d => d.index === index)
  if (!entry) return false
  const s = scene()
  s.remove(entry.group)
  placedDecor = placedDecor.filter(d => d.index !== index)
  return true
}

export function getPlacedDecor() { return placedDecor }

export function getDecorAtPosition(position) {
  const eps = 0.8
  for (const decor of placedDecor) {
    const pos = DECOR_POSITIONS[decor.index]
    const dx = pos.x - position.x
    const dz = pos.z - position.z
    if (Math.abs(dx) < eps && Math.abs(dz) < eps) return decor
  }
  return null
}

export function getDecorPosition(index) {
  return DECOR_POSITIONS[index]
}

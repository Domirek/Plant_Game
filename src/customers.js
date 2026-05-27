import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getScene, getCamera } from './scene.js'
import { getState, addCoins, nextDay } from './game.js'
import { PLANT_TYPES } from './plants.js'

const loader = new GLTFLoader()

const CUSTOMER_NAMES = [
  'Elara the Elf', 'Borin Stonebeard', 'Luna Moonshadow',
  'Finn Swiftarrow', 'Greta Goodroot', 'Kael Thunderclap',
  'Mira Lightfoot', 'Orin Oakenshield', 'Sera Brightbloom',
]

const CUSTOMER_MODELS = [
  '/assets/characters/KayKit_Adventurers_2.0_FREE/Characters/gltf/Barbarian.glb',
  '/assets/characters/KayKit_Adventurers_2.0_FREE/Characters/gltf/Knight.glb',
  '/assets/characters/KayKit_Adventurers_2.0_FREE/Characters/gltf/Mage.glb',
  '/assets/characters/KayKit_Adventurers_2.0_FREE/Characters/gltf/Ranger.glb',
  '/assets/characters/KayKit_Adventurers_2.0_FREE/Characters/gltf/Rogue.glb',
  '/assets/characters/KayKit_Adventurers_2.0_FREE/Characters/gltf/Rogue_Hooded.glb',
]

let currentCustomer = null
let customerMesh = null
let customerGroup = null
let walkTarget = null
let walkSpeed = 2.5
let isWalking = false
let orderActive = false
let onArrivedCallback = null
let spawnTimer = 0
const SPAWN_DELAY = 8

export function getCurrentCustomer() { return currentCustomer }
export function isOrderActive() { return orderActive }

export function spawnCustomer() {
  if (currentCustomer) return

  const name = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)]
  const modelPath = CUSTOMER_MODELS[Math.floor(Math.random() * CUSTOMER_MODELS.length)]
  const wants = PLANT_TYPES[Math.floor(Math.random() * PLANT_TYPES.length)]

  const reward = Math.floor(wants.sellPrice * (0.8 + Math.random() * 0.4))

  currentCustomer = { name, modelPath, wants: wants.id, reward }
  orderActive = false

  customerGroup = new THREE.Group()
  customerGroup.position.set(8, 0, 0)

  loader.load(modelPath, (gltf) => {
    const mesh = gltf.scene
    mesh.scale.set(0.5, 0.5, 0.5)
    mesh.traverse(c => { c.castShadow = true; c.receiveShadow = true })
    customerGroup.add(mesh)
    customerMesh = mesh
  })

  getScene().add(customerGroup)
  walkToPosition({ x: 0, z: -2 }, () => {
    orderActive = true
  })
}

function walkToPosition(pos, onArrived) {
  walkTarget = new THREE.Vector3(pos.x, 0, pos.z)
  isWalking = true
  onArrivedCallback = onArrived

  const dir = new THREE.Vector3().copy(walkTarget).sub(customerGroup.position)
  dir.y = 0
  if (dir.length() > 0.01) {
    const angle = Math.atan2(dir.x, dir.z)
    customerGroup.rotation.y = angle
  }
}

export function fulfillOrder() {
  if (!currentCustomer || !orderActive) return null
  return currentCustomer.wants
}

export function completeOrder() {
  if (!currentCustomer) return

  addCoins(currentCustomer.reward)
  orderActive = false

  walkToPosition({ x: -8, z: 0 }, () => {
    departCustomer()
  })
}

function departCustomer() {
  if (customerMesh) {
    customerGroup.remove(customerMesh)
    customerMesh = null
  }
  getScene().remove(customerGroup)
  customerGroup = null
  currentCustomer = null
  orderActive = false
  isWalking = false
  walkTarget = null
}

export function updateCustomers(delta) {
  spawnTimer += delta

  if (!currentCustomer && spawnTimer >= SPAWN_DELAY) {
    spawnTimer = 0
    spawnCustomer()
  }

  if (isWalking && customerGroup && walkTarget) {
    const dir = new THREE.Vector3().copy(walkTarget).sub(customerGroup.position)
    dir.y = 0
    const dist = dir.length()

    if (dist > 0.1) {
      dir.normalize()
      customerGroup.position.x += dir.x * walkSpeed * delta
      customerGroup.position.z += dir.z * walkSpeed * delta

      const angle = Math.atan2(dir.x, dir.z)
      customerGroup.rotation.y = angle
    } else {
      isWalking = false
      walkTarget = null
      if (onArrivedCallback) {
        onArrivedCallback()
        onArrivedCallback = null
      }
    }
  }
}

export function resetCustomerTimer() {
  spawnTimer = SPAWN_DELAY - 3
}

import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { getScene } from './scene.js'

const loader = new FBXLoader()
let cat = null
let isWalking = false
let walkTarget = null
let idleTimer = 0
let idleDuration = 0
const WALK_SPEED = 1.5
const IDLE_MIN = 2
const IDLE_MAX = 5
const BOUNDS = { minX: -5, maxX: 5, minZ: -3, maxZ: 4 }

let meowTimer = 0
let lastPetTime = 0
const PET_COOLDOWN = 60
const MEOW_DURATION = 1

export function loadCat() {
  return new Promise((resolve) => {
    loader.load('/assets/cat/cat.fbx', (fbx) => {
      cat = fbx
      cat.scale.set(0.0027, 0.0027, 0.0027)
      cat.position.set(4, 0, 3)
      cat.traverse(c => {
        c.castShadow = true
        c.receiveShadow = true
      })
      getScene().add(cat)
      pickNewTarget()
      resolve()
    })
  })
}

function pickNewTarget() {
  if (!cat) return
  walkTarget = new THREE.Vector3(
    BOUNDS.minX + Math.random() * (BOUNDS.maxX - BOUNDS.minX),
    0,
    BOUNDS.minZ + Math.random() * (BOUNDS.maxZ - BOUNDS.minZ)
  )
  isWalking = true
  idleTimer = 0
}

export function getCatMeshes() {
  if (!cat) return []
  const meshes = []
  cat.traverse(child => {
    if (child.isMesh) meshes.push(child)
  })
  return meshes
}

export function tryPetCat() {
  const now = performance.now() / 1000
  if (now - lastPetTime < PET_COOLDOWN) return false
  lastPetTime = now
  meowTimer = MEOW_DURATION
  return true
}

export function getMeowState() {
  if (!cat || meowTimer <= 0) return { active: false }
  const pos = new THREE.Vector3()
  cat.getWorldPosition(pos)
  pos.y += 0.6
  return { active: true, position: pos }
}

export function updateCat(delta) {
  if (!cat) return

  if (meowTimer > 0) {
    meowTimer -= delta
  }

  if (isWalking && walkTarget) {
    const dir = new THREE.Vector3().copy(walkTarget).sub(cat.position)
    dir.y = 0
    const dist = dir.length()

    if (dist > 0.1) {
      dir.normalize()
      cat.position.x += dir.x * WALK_SPEED * delta
      cat.position.z += dir.z * WALK_SPEED * delta
      const angle = Math.atan2(dir.x, dir.z)
      cat.rotation.y = angle
    } else {
      isWalking = false
      walkTarget = null
      idleTimer = 0
      idleDuration = IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN)
    }
  } else {
    idleTimer += delta
    if (idleTimer >= idleDuration) {
      pickNewTarget()
    }
  }
}

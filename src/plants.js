import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getScene } from './scene.js'
import { getGardenBeds } from './environment.js'
import { addCoins, getState } from './game.js'

const loader = new GLTFLoader()

export const PLANT_TYPES = [
  { id: 'cactus', name: 'Cactus', cost: 10, sellPrice: 25, growthTime: 15 },
  { id: 'monstera', name: 'Monstera', cost: 15, sellPrice: 35, growthTime: 20 },
  { id: 'succulent', name: 'Succulent', cost: 8, sellPrice: 20, growthTime: 12 },
  { id: 'sansevieria', name: 'Sansevieria', cost: 12, sellPrice: 30, growthTime: 18 },
  { id: 'pothos', name: 'Pothos', cost: 10, sellPrice: 28, growthTime: 16 },
]

const growthModels = {
  cactus: {
    small: '/assets/plants/Assets/gltf/cactus_A.gltf',
    medium: '/assets/plants/Assets/gltf/cactus_C.gltf',
    large: '/assets/plants/Assets/gltf/cacti_plant_pot_large.gltf',
  },
  monstera: {
    small: '/assets/plants/Assets/gltf/monstera_plant_small.gltf',
    medium: '/assets/plants/Assets/gltf/monstera_plant_medium.gltf',
    large: '/assets/plants/Assets/gltf/monstera_plant_large.gltf',
  },
  succulent: {
    small: '/assets/plants/Assets/gltf/succulent_A.gltf',
    medium: '/assets/plants/Assets/gltf/succulent_C.gltf',
    large: '/assets/plants/Assets/gltf/succulent_plant_pot_large.gltf',
  },
  sansevieria: {
    small: '/assets/plants/Assets/gltf/sansevieria_plant_small.gltf',
    medium: '/assets/plants/Assets/gltf/sansevieria_plant_medium.gltf',
    large: '/assets/plants/Assets/gltf/sansevieria_plant_large.gltf',
  },
  pothos: {
    small: '/assets/plants/Assets/gltf/pothos_plant_small.gltf',
    medium: '/assets/plants/Assets/gltf/pothos_plant_medium.gltf',
    large: '/assets/plants/Assets/gltf/pothos_plant_large.gltf',
  },
}

export function plantSeed(bed, plantType) {
  if (bed.planted || bed.mature) return false

  const plant = PLANT_TYPES.find(p => p.id === plantType)
  if (!plant) return false
  if (getState().coins < plant.cost) return false

  addCoins(-plant.cost)

  bed.planted = true
  bed.plantType = plantType
  bed.stage = 0
  bed.waterLevel = 0
  bed.growthTimer = 0
  bed.mature = false

  loadPlantModel(bed, 'small')
  return true
}

function loadPlantModel(bed, stage) {
  const type = bed.plantType
  const path = growthModels[type]?.[stage]
  if (!path) return

  if (bed.mesh) {
    bed.group.remove(bed.mesh)
    bed.mesh = null
  }

  loader.load(path, (gltf) => {
    const mesh = gltf.scene
    mesh.position.y = 0.12
    mesh.scale.set(0.4, 0.4, 0.4)
    mesh.traverse(c => { c.castShadow = true; c.receiveShadow = true })
    bed.group.add(mesh)
    bed.mesh = mesh
  })
}

export function waterPlant(bed) {
  if (!bed.planted || bed.mature) return
  bed.waterLevel = Math.min(bed.waterLevel + 0.3, 1)
}

export function updatePlants(delta) {
  const beds = getGardenBeds()

  for (const bed of beds) {
    if (!bed.planted || bed.mature) continue

    const plant = PLANT_TYPES.find(p => p.id === bed.plantType)
    if (!plant) continue

    const growthRate = 0.3 + bed.waterLevel * 0.7
    bed.growthTimer += delta * growthRate * (1 / plant.growthTime)

    if (bed.growthTimer >= 1 && bed.stage < 2) {
      bed.stage = 1
      loadPlantModel(bed, 'medium')
    }
    if (bed.growthTimer >= 2 && bed.stage < 3) {
      bed.stage = 2
      loadPlantModel(bed, 'large')
      bed.mature = true
    }

    bed.waterLevel = Math.max(0, bed.waterLevel - delta * 0.05)
  }
}

export function harvestPlant(bed) {
  if (!bed.mature) return null

  const plantType = bed.plantType
  const plant = PLANT_TYPES.find(p => p.id === plantType)

  if (bed.mesh) {
    bed.group.remove(bed.mesh)
    bed.mesh = null
  }

  bed.planted = false
  bed.plantType = null
  bed.stage = 0
  bed.waterLevel = 0
  bed.growthTimer = 0
  bed.mature = false

  return plant
}

export function getPlantModelPath(type, stage) {
  const stages = ['small', 'medium', 'large']
  return growthModels[type]?.[stages[stage]]
}

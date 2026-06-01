import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getScene } from './scene.js'

const loader = new GLTFLoader()

export const PLANT_TYPES = [
  { id: 'cactus', name: 'Cactus' },
  { id: 'monstera', name: 'Monstera' },
  { id: 'succulent', name: 'Succulent' },
  { id: 'sansevieria', name: 'Sansevieria' },
  { id: 'pothos', name: 'Pothos' },
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
  if (bed.planted) return false

  const plant = PLANT_TYPES.find(p => p.id === plantType)
  if (!plant) return false

  bed.planted = true
  bed.plantType = plantType
  bed.stage = 0
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

export function updatePlantGrowth(bed, progress) {
  let newStage = 0
  if (progress >= 0.66) newStage = 2
  else if (progress >= 0.33) newStage = 1

  if (newStage !== bed.stage) {
    bed.stage = newStage
    bed.mature = (newStage === 2)
    const stageNames = ['small', 'medium', 'large']
    loadPlantModel(bed, stageNames[newStage])
  }
}

export function clearBed(bed) {
  if (bed.mesh) {
    bed.group.remove(bed.mesh)
    bed.mesh = null
  }
  bed.planted = false
  bed.plantType = null
  bed.stage = 0
  bed.mature = false
}

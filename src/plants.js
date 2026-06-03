import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getScene } from './scene.js'
import { asset } from './paths.js'

const loader = new GLTFLoader()

export const PLANT_TYPES = [
  { id: 'cactus', name: 'Cactus' },
  { id: 'monstera', name: 'Monstera' },
  { id: 'succulent', name: 'Succulent' },
  { id: 'sansevieria', name: 'Sansevieria' },
  { id: 'pothos', name: 'Pothos' },
]

const a = (path) => asset('/assets/plants/Assets/gltf/' + path)
const growthModels = {
  cactus: {
    small: a('cactus_A.gltf'),
    medium: a('cactus_C.gltf'),
    large: a('cacti_plant_pot_large.gltf'),
  },
  monstera: {
    small: a('monstera_plant_small.gltf'),
    medium: a('monstera_plant_medium.gltf'),
    large: a('monstera_plant_large.gltf'),
  },
  succulent: {
    small: a('succulent_A.gltf'),
    medium: a('succulent_C.gltf'),
    large: a('succulent_plant_pot_large.gltf'),
  },
  sansevieria: {
    small: a('sansevieria_plant_small.gltf'),
    medium: a('sansevieria_plant_medium.gltf'),
    large: a('sansevieria_plant_large.gltf'),
  },
  pothos: {
    small: a('pothos_plant_small.gltf'),
    medium: a('pothos_plant_medium.gltf'),
    large: a('pothos_plant_large.gltf'),
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

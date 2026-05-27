import * as THREE from 'three'
import { getCamera } from './scene.js'
import { getGardenBeds } from './environment.js'
import { plantSeed, waterPlant, harvestPlant, PLANT_TYPES } from './plants.js'
import { getState, addCoins } from './game.js'
import { fulfillOrder, completeOrder, isOrderActive, getCurrentCustomer } from './customers.js'
import { updateUI, highlightBed, clearHighlight } from './ui.js'

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let selectedSeed = null
let hoveredBed = null

export function getSelectedSeed() { return selectedSeed }
export function setSelectedSeed(type) { selectedSeed = type }

export function setupInteraction(canvas) {
  canvas.addEventListener('click', onClick)
  canvas.addEventListener('pointermove', onPointerMove)

  document.addEventListener('fulfill-order', () => {
    handleSellClick()
  })
}

function getClickableObjects() {
  const objects = []
  const beds = getGardenBeds()
  for (const bed of beds) {
    bed.group.children.forEach(child => {
      if (child.isMesh) {
        child.userData.bedIndex = bed.index
        objects.push(child)
      }
    })
  }
  return objects
}

function onClick(event) {
  const rect = event.target.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, getCamera())
  const intersects = raycaster.intersectObjects(getClickableObjects(), false)

  if (intersects.length > 0) {
    const hit = intersects[0].object
    const bedIndex = hit.userData.bedIndex
    const beds = getGardenBeds()
    const bed = beds[bedIndex]
    if (!bed) return
    handleBedClick(bed)
    return
  }

  if (isOrderActive()) {
    handleSellClick()
  }

  selectedSeed = null
  updateUI()
}

function handleBedClick(bed) {
  if (bed.mature) {
    const harvested = harvestPlant(bed)
    if (harvested) {
      updateUI()
    }
    return
  }

  if (bed.planted) {
    waterPlant(bed)
    updateUI()
    return
  }

  if (selectedSeed) {
    const success = plantSeed(bed, selectedSeed)
    if (success) {
      updateUI()
    }
  }
}

function handleSellClick() {
  const wantedType = fulfillOrder()
  if (!wantedType) return

  const beds = getGardenBeds()
  const hasMature = beds.some(b => b.mature && b.plantType === wantedType)

  if (hasMature) {
    completeOrder()
    updateUI()
  }
}

function onPointerMove(event) {
  const rect = event.target.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, getCamera())
  const intersects = raycaster.intersectObjects(getClickableObjects(), false)

  if (intersects.length > 0) {
    const bedIndex = intersects[0].object.userData.bedIndex
    const beds = getGardenBeds()
    const bed = beds[bedIndex]
    if (bed) {
      if (hoveredBed && hoveredBed !== bed) clearHighlight(hoveredBed)
      highlightBed(bed)
      hoveredBed = bed
      document.body.style.cursor = 'pointer'
    }
  } else {
    if (hoveredBed) {
      clearHighlight(hoveredBed)
      hoveredBed = null
    }
    document.body.style.cursor = 'default'
  }
}

import * as THREE from 'three'
import { getCamera } from './scene.js'
import { getGardenBeds, getPlacedDecor } from './environment.js'
import { plantSeed, clearBed } from './plants.js'
import { getState, startSession, completeSession, getSessionForBed, addCoins, recordCatPet } from './game.js'
import { updateUI, getPanelPlantType, getPanelMinutes } from './ui.js'
import { getCatMeshes, tryPetCat } from './cat.js'


const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const highlightOutlines = []

export function setupInteraction(canvas) {
  canvas.addEventListener('click', onClick)
  canvas.addEventListener('pointermove', onPointerMove)
}

function getClickableObjects() {
  const objects = []
  const beds = getGardenBeds()
  for (const bed of beds) {
    bed.group.children.forEach(child => {
      if (child.isMesh) {
        child.userData.bedIndex = bed.index
        child.userData.isCat = false
        child.userData.isDecor = false
        objects.push(child)
      }
    })
  }
  for (const mesh of getCatMeshes()) {
    mesh.userData.isCat = true
    mesh.userData.bedIndex = -1
    mesh.userData.isDecor = false
    objects.push(mesh)
  }
  for (const decor of getPlacedDecor()) {
    decor.group.children.forEach(child => {
      if (child.isMesh) {
        child.userData.isDecor = true
        child.userData.decorIndex = decor.index
        child.userData.bedIndex = -1
        child.userData.isCat = false
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
    if (hit.userData.isCat) {
      handleCatClick()
      return
    }
    const bedIndex = hit.userData.bedIndex
    if (bedIndex >= 0) {
      const bed = getGardenBeds()[bedIndex]
      if (bed) handleBedClick(bed)
    }
  }
}

function handleCatClick() {
  if (tryPetCat()) {
    addCoins(5)
    recordCatPet()
    updateUI()
  }
}

function handleBedClick(bed) {
  const session = getSessionForBed(bed)

  if (session) {
    if (session.complete) {
      clearBed(bed)
      completeSession(session)
      updateUI()
    }
    return
  }

  const plantType = getPanelPlantType()
  if (!plantType) return
  const taskText = document.getElementById('task-input').value.trim() || 'Focus session'
  const totalMinutes = getPanelMinutes()

  startSession(bed, plantType, taskText, totalMinutes)
  plantSeed(bed, plantType)
  updateUI()
}

function onPointerMove(event) {
  const rect = event.target.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, getCamera())
  const intersects = raycaster.intersectObjects(getClickableObjects(), false)

  clearHighlights()

  if (intersects.length > 0) {
    const hit = intersects[0].object
    if (hit.userData.isCat) {
      document.body.style.cursor = 'pointer'
    } else if (hit.userData.isDecor) {
      document.body.style.cursor = 'pointer'
    } else if (hit.userData.bedIndex >= 0) {
      const bed = getGardenBeds()[hit.userData.bedIndex]
      if (bed) {
        highlightBed(bed)
        document.body.style.cursor = 'pointer'
      }
    }
  } else {
    document.body.style.cursor = 'default'
  }
}

function highlightBed(bed) {
  const box = new THREE.Box3().setFromObject(bed.group)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(size.x + 0.15, 0.08, size.z + 0.15))
  const mat = new THREE.LineBasicMaterial({ color: 0xa8c090, transparent: true, opacity: 0.6 })
  const outline = new THREE.LineSegments(geo, mat)
  outline.position.copy(center)
  outline.position.y = 0.04
  bed.group.parent.add(outline)
  highlightOutlines.push(outline)
}

function clearHighlights() {
  for (const outline of highlightOutlines) {
    outline.parent?.remove(outline)
    outline.geometry?.dispose()
    outline.material?.dispose()
  }
  highlightOutlines.length = 0
}

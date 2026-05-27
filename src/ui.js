import { getGardenBeds } from './environment.js'
import { PLANT_TYPES } from './plants.js'
import { getState } from './game.js'
import { getCurrentCustomer, isOrderActive } from './customers.js'
import { setSelectedSeed, getSelectedSeed } from './interactions.js'
import * as THREE from 'three'

let highlightOutline = null

export function updateUI() {
  updateCoins()
  updateSeeds()
  updateCustomerOrder()
}

function updateCoins() {
  const el = document.getElementById('coins')
  if (el) el.innerHTML = `${getState().coins} <span class="icon">🪙</span>`
}

function updateSeeds() {
  const container = document.getElementById('seed-list')
  if (!container) return

  container.innerHTML = ''
  const selected = getSelectedSeed()

  PLANT_TYPES.forEach(plant => {
    const btn = document.createElement('button')
    btn.className = 'seed-btn' + (selected === plant.id ? ' selected' : '')
    btn.innerHTML = `${plant.name} <span class="cost">${plant.cost}🪙</span>`
    btn.disabled = getState().coins < plant.cost
    btn.addEventListener('click', () => {
      if (selected === plant.id) {
        setSelectedSeed(null)
      } else {
        setSelectedSeed(plant.id)
      }
      updateUI()
    })
    container.appendChild(btn)
  })
}

function updateCustomerOrder() {
  const panel = document.getElementById('order-panel')
  const content = document.getElementById('order-content')
  const btn = document.getElementById('fulfill-btn')
  if (!panel || !content || !btn) return

  const customer = getCurrentCustomer()
  const active = isOrderActive()

  if (customer && active) {
    panel.classList.remove('hidden')
    content.innerHTML = `
      <div class="customer-name">${customer.name}</div>
      <div class="order-text">Wants: <strong>${PLANT_TYPES.find(p => p.id === customer.wants)?.name || customer.wants}</strong></div>
      <div class="order-text">Reward: ${customer.reward}🪙</div>
    `

    const beds = getGardenBeds()
    const hasMature = beds.some(b => b.mature && b.plantType === customer.wants)
    btn.classList.toggle('hidden', !hasMature)
    btn.textContent = `Sell for ${customer.reward}🪙`

    btn.onclick = () => {
      // Will be handled by interactions, but we trigger it from here too
      const event = new CustomEvent('fulfill-order')
      document.dispatchEvent(event)
    }
  } else if (customer && !active) {
    panel.classList.remove('hidden')
    content.innerHTML = `
      <div class="customer-name">${customer.name}</div>
      <div class="order-text">On the way...</div>
    `
    btn.classList.add('hidden')
  } else {
    panel.classList.add('hidden')
  }
}

export function highlightBed(bed) {
  if (highlightOutline) {
    clearHighlight()
  }

  if (bed.mature) {
    const group = bed.group
    const box = new THREE.Box3().setFromObject(group)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(size.x + 0.2, 0.1, size.z + 0.2))
    const mat = new THREE.LineBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0.8 })
    highlightOutline = new THREE.LineSegments(geo, mat)
    highlightOutline.position.copy(center)
    highlightOutline.position.y = 0.05
    bed.group.parent.add(highlightOutline)
  }
}

export function clearHighlight(bed) {
  if (highlightOutline) {
    highlightOutline.parent?.remove(highlightOutline)
    highlightOutline.geometry?.dispose()
    highlightOutline.material?.dispose()
    highlightOutline = null
  }
}

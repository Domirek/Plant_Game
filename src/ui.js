import * as THREE from 'three'
import { PLANT_TYPES } from './plants.js'
import { getState } from './game.js'
import { getCamera } from './scene.js'
import { getMeowState } from './cat.js'
import { getShopItems, buyItem } from './shop.js'

const PLANT_ICONS = {
  cactus: '🌵',
  monstera: '🌿',
  succulent: '🌱',
  sansevieria: '🪴',
  pothos: '🍃',
}

let selectedPlant = null
let selectedMinutes = 5
const labelElements = new Map()

export function setupUI() {
  populatePlantButtons()
  setupTimePresets()
  setupShop()
}

let shopOpen = false

function setupShop() {
  const shopBtn = document.getElementById('shop-btn')
  const shopPanel = document.getElementById('shop-panel')
  const shopClose = document.getElementById('shop-close')
  if (!shopBtn || !shopPanel || !shopClose) return

  shopBtn.addEventListener('click', () => {
    shopOpen = !shopOpen
    shopPanel.classList.toggle('hidden', !shopOpen)
    if (shopOpen) renderShop()
  })

  shopClose.addEventListener('click', () => {
    shopOpen = false
    shopPanel.classList.add('hidden')
  })
}

function populatePlantButtons() {
  const container = document.getElementById('plant-select')
  if (!container) return

  PLANT_TYPES.forEach(plant => {
    const btn = document.createElement('button')
    btn.className = 'plant-btn' + (selectedPlant === plant.id ? ' selected' : '')
    btn.innerHTML = `<span class="plant-icon">${PLANT_ICONS[plant.id] || '🌱'}</span>${plant.name}`
    btn.addEventListener('click', () => {
      selectedPlant = (selectedPlant === plant.id) ? null : plant.id
      container.querySelectorAll('.plant-btn').forEach(b => b.classList.toggle('selected', b === btn && selectedPlant !== null))
    })
    container.appendChild(btn)
  })
}

function setupTimePresets() {
  const presets = document.querySelectorAll('.preset-btn')
  const customInput = document.getElementById('custom-time')
  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      presets.forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
      selectedMinutes = parseInt(btn.dataset.min, 10)
      customInput.value = ''
    })
  })
  customInput.addEventListener('input', () => {
    const val = parseInt(customInput.value, 10)
    if (!isNaN(val) && val > 0) {
      presets.forEach(b => b.classList.remove('selected'))
      selectedMinutes = val
    }
  })
}

export function getPanelPlantType() { return selectedPlant }
export function getPanelMinutes() { return selectedMinutes }

export function updateUI() {
  const state = getState()

  document.getElementById('coins').innerHTML = `${state.coins} <span class="icon">🪙</span>`

  const sessionList = document.getElementById('session-list')
  const sessionItems = document.getElementById('session-items')

  if (state.sessions.length > 0) {
    sessionList.classList.remove('hidden')
    sessionItems.innerHTML = ''
    for (const s of state.sessions) {
      const item = document.createElement('div')
      item.className = 'session-item'
      const icon = PLANT_ICONS[s.plantType] || '🌱'
      const remaining = Math.max(0, s.totalTime - s.elapsedTime)
      if (s.complete) {
        item.innerHTML = `<span class="session-icon">${icon}</span><span class="session-task">${s.taskText}</span><span class="session-status ready">✨ Ready!</span>`
      } else {
        item.innerHTML = `<span class="session-icon">${icon}</span><span class="session-task">${s.taskText}</span><span class="session-status">${formatTime(remaining)}</span>`
      }
      sessionItems.appendChild(item)
    }
  } else {
    sessionList.classList.add('hidden')
  }

  syncLabels()
  updateMeowLabel()
  renderNotifications(state)
  renderDailyQuests(state)
  renderAchievements(state)
  if (shopOpen) renderShop()
}

function renderNotifications(state) {
  const container = document.getElementById('notifications')
  if (!container) return
  container.innerHTML = ''
  for (const n of state.notifications) {
    const el = document.createElement('div')
    el.className = 'notif-item'
    el.textContent = n.text
    container.appendChild(el)
  }
}

function renderDailyQuests(state) {
  const container = document.getElementById('daily-items')
  if (!container) return
  container.innerHTML = ''
  for (const q of state.dailyQuests) {
    const item = document.createElement('div')
    item.className = 'reward-card'
    const val = state.stats[q.stat]
    const pct = Math.min(val / q.threshold, 1)
    if (q.done) {
      item.innerHTML = `<div class="reward-row"><span class="reward-icon">${q.icon}</span><span class="reward-text">${q.desc}</span><span class="reward-check">✅</span></div><div class="reward-bar"><div class="reward-fill done" style="width:100%"></div></div>`
    } else {
      item.innerHTML = `<div class="reward-row"><span class="reward-icon">${q.icon}</span><span class="reward-text">${q.desc}</span><span class="reward-coin">+${q.reward}🪙</span></div><div class="reward-bar"><div class="reward-fill" style="width:${pct * 100}%"></div></div><div class="reward-progress">${Math.min(val, q.threshold)}/${q.threshold}</div>`
    }
    container.appendChild(item)
  }
}

function renderAchievements(state) {
  const container = document.getElementById('achievement-items')
  if (!container) return
  container.innerHTML = ''
  for (const a of state.achievements) {
    const item = document.createElement('div')
    item.className = 'reward-card'
    const val = state.stats[a.stat]
    const pct = Math.min(val / a.threshold, 1)
    if (a.done) {
      item.innerHTML = `<div class="reward-row"><span class="reward-icon">${a.icon}</span><span class="reward-text">${a.name}</span><span class="reward-check">✅</span></div><div class="reward-bar"><div class="reward-fill done" style="width:100%"></div></div>`
    } else {
      item.innerHTML = `<div class="reward-row"><span class="reward-icon">${a.icon}</span><span class="reward-text">${a.name}</span><span class="reward-coin">+${a.reward}🪙</span></div><div class="reward-bar"><div class="reward-fill" style="width:${pct * 100}%"></div></div><div class="reward-progress">${Math.min(val, a.threshold)}/${a.threshold}</div>`
    }
    container.appendChild(item)
  }
}

function syncLabels() {
  const state = getState()
  const container = document.getElementById('bed-labels')
  const activeIds = new Set()

  for (const s of state.sessions) {
    activeIds.add(s.id)
    let el = labelElements.get(s.id)
    if (!el) {
      el = document.createElement('div')
      el.className = 'bed-label'
      container.appendChild(el)
      labelElements.set(s.id, el)
    }
    if (s.complete) {
      el.textContent = '✨ Ready!'
    } else {
      const remaining = Math.max(0, s.totalTime - s.elapsedTime)
      el.textContent = formatTime(remaining)
    }
    const worldPos = new THREE.Vector3()
    s.bed.group.getWorldPosition(worldPos)
    worldPos.y += 1.0
    const screenPos = projectToScreen(worldPos)
    el.style.left = `${screenPos.x}px`
    el.style.top = `${screenPos.y}px`
    el.classList.remove('hidden')
  }

  for (const [id, el] of labelElements) {
    if (!activeIds.has(id)) {
      el.remove()
      labelElements.delete(id)
    }
  }
}

function updateMeowLabel() {
  const meowLabel = document.getElementById('meow-label')
  const meow = getMeowState()
  if (meow.active && meow.position) {
    meowLabel.classList.remove('hidden')
    meowLabel.textContent = 'Meow!'
    const screenPos = projectToScreen(meow.position)
    meowLabel.style.left = `${screenPos.x}px`
    meowLabel.style.top = `${screenPos.y}px`
  } else {
    meowLabel.classList.add('hidden')
  }
}

function renderShop() {
  const container = document.getElementById('shop-items')
  if (!container) return
  container.innerHTML = ''
  const state = getState()
  const items = getShopItems()
  for (const item of items) {
    const card = document.createElement('div')
    card.className = 'shop-card'
    const owned = state.purchasedDecor.some(p => p.itemId === item.id)
    const canAfford = state.coins >= item.price
    const noSpace = state.purchasedDecor.length >= 12
    card.innerHTML = `
      <div class="shop-card-top">
        <span class="shop-icon">${item.icon}</span>
        <span class="shop-name">${item.name}</span>
      </div>
      <div class="shop-card-bottom">
        <span class="shop-price">${item.price} 🪙</span>
        ${owned ? '<span class="shop-owned">✅</span>' : `<button class="shop-buy-btn" data-id="${item.id}" ${!canAfford || noSpace ? 'disabled' : ''}>${noSpace ? 'Full' : 'Buy'}</button>`}
      </div>`
    container.appendChild(card)

    const btn = card.querySelector('.shop-buy-btn')
    if (btn) {
      btn.addEventListener('click', () => {
        if (buyItem(item.id)) {
          updateUI()
        }
      })
    }
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function projectToScreen(worldPos) {
  const camera = getCamera()
  const vec = worldPos.clone().project(camera)
  const w = window.innerWidth
  const h = window.innerHeight
  return {
    x: (vec.x * 0.5 + 0.5) * w,
    y: (-vec.y * 0.5 + 0.5) * h,
  }
}

import { updatePlants } from './plants.js'
import { updateCustomers } from './customers.js'

const state = {
  coins: 50,
  day: 1,
  phase: 'growing',
}

export function getState() { return state }

export function addCoins(amount) {
  state.coins = Math.max(0, state.coins + amount)
}

export function nextDay() {
  state.day++
}

export function updateGame(delta) {
  updatePlants(delta)
  updateCustomers(delta)
}

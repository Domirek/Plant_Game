import { getState, spendCoins, addCoins, pushNotification } from './game.js'
import { placeDecor } from './environment.js'
import { asset } from './paths.js'

const s = (p) => asset(p)

const SHOP_ITEMS = [
  { id: 'fountain', name: 'Fountain', price: 75, icon: '⛲', path: s('/assets/shop/Tiny_Treats_Pretty_Park_1.0_FREE/Tiny_Treats_Pretty_Park_1.0_FREE/Assets/gltf/fountain.gltf'), scale: 0.7 },
  { id: 'street_lantern', name: 'Street Lantern', price: 50, icon: '🏮', path: s('/assets/shop/Tiny_Treats_Pretty_Park_1.0_FREE/Tiny_Treats_Pretty_Park_1.0_FREE/Assets/gltf/street_lantern.gltf'), scale: 0.7 },
  { id: 'bench', name: 'Bench', price: 40, icon: '🪑', path: s('/assets/shop/Tiny_Treats_Pretty_Park_1.0_FREE/Tiny_Treats_Pretty_Park_1.0_FREE/Assets/gltf/bench.gltf'), scale: 0.7 },
  { id: 'bird', name: 'Bird', price: 20, icon: '🐦', path: s('/assets/shop/Tiny_Treats_Pretty_Park_1.0_FREE/Tiny_Treats_Pretty_Park_1.0_FREE/Assets/gltf/bird.gltf'), scale: 0.7 },
  { id: 'flower_A', name: 'Flowers A', price: 15, icon: '🌸', path: s('/assets/shop/Tiny_Treats_Pretty_Park_1.0_FREE/Tiny_Treats_Pretty_Park_1.0_FREE/Assets/gltf/flower_A.gltf'), scale: 0.7 },
  { id: 'flower_B', name: 'Flowers B', price: 15, icon: '🌺', path: s('/assets/shop/Tiny_Treats_Pretty_Park_1.0_FREE/Tiny_Treats_Pretty_Park_1.0_FREE/Assets/gltf/flower_B.gltf'), scale: 0.7 },
  { id: 'bush', name: 'Bush', price: 20, icon: '🌳', path: s('/assets/shop/Tiny_Treats_Pretty_Park_1.0_FREE/Tiny_Treats_Pretty_Park_1.0_FREE/Assets/gltf/bush.gltf'), scale: 0.7 },
  { id: 'bush_large', name: 'Large Bush', price: 30, icon: '🌲', path: s('/assets/shop/Tiny_Treats_Pretty_Park_1.0_FREE/Tiny_Treats_Pretty_Park_1.0_FREE/Assets/gltf/bush_large.gltf'), scale: 0.7 },
  { id: 'trashcan', name: 'Trash Can', price: 25, icon: '🗑️', path: s('/assets/shop/Tiny_Treats_Pretty_Park_1.0_FREE/Tiny_Treats_Pretty_Park_1.0_FREE/Assets/gltf/trashcan.gltf'), scale: 0.7 },
  { id: 'merry_go_round', name: 'Merry-Go-Round', price: 100, icon: '🎠', path: s('/assets/shop/Tiny_Treats_Fun_Playground_1.0_FREE/Tiny_Treats_Fun_Playground_1.0_FREE/Assets/gltf/merry_go_round.gltf'), scale: 0.7 },
  { id: 'monkeybar_A', name: 'Monkey Bars', price: 80, icon: '🤸', path: s('/assets/shop/Tiny_Treats_Fun_Playground_1.0_FREE/Tiny_Treats_Fun_Playground_1.0_FREE/Assets/gltf/monkeybar_A.gltf'), scale: 0.7 },
  { id: 'seesaw_large', name: 'Seesaw', price: 60, icon: '⚖️', path: s('/assets/shop/Tiny_Treats_Fun_Playground_1.0_FREE/Tiny_Treats_Fun_Playground_1.0_FREE/Assets/gltf/seesaw_large.gltf'), scale: 0.7 },
  { id: 'sandbox_round', name: 'Sandbox', price: 55, icon: '🏖️', path: s('/assets/shop/Tiny_Treats_Fun_Playground_1.0_FREE/Tiny_Treats_Fun_Playground_1.0_FREE/Assets/gltf/sandbox_round.gltf'), scale: 0.7 },
  { id: 'picnic_table', name: 'Picnic Table', price: 45, icon: '🧺', path: s('/assets/shop/Tiny_Treats_Fun_Playground_1.0_FREE/Tiny_Treats_Fun_Playground_1.0_FREE/Assets/gltf/picnic_table.gltf'), scale: 0.7 },
  { id: 'cart', name: 'Cart', price: 35, icon: '🛒', path: s('/assets/shop/Tiny_Treats_Fun_Playground_1.0_FREE/Tiny_Treats_Fun_Playground_1.0_FREE/Assets/gltf/cart.gltf'), scale: 0.7 },
  { id: 'spring_horse_B', name: 'Spring Horse', price: 30, icon: '🐴', path: s('/assets/shop/Tiny_Treats_Fun_Playground_1.0_FREE/Tiny_Treats_Fun_Playground_1.0_FREE/Assets/gltf/spring_horse_B.gltf'), scale: 0.7 },
  { id: 'sandcastle_A', name: 'Sandcastle', price: 20, icon: '🏰', path: s('/assets/shop/Tiny_Treats_Fun_Playground_1.0_FREE/Tiny_Treats_Fun_Playground_1.0_FREE/Assets/gltf/sandcastle_A.gltf'), scale: 0.7 },
  { id: 'bucket_A', name: 'Bucket', price: 10, icon: '🪣', path: s('/assets/shop/Tiny_Treats_Fun_Playground_1.0_FREE/Tiny_Treats_Fun_Playground_1.0_FREE/Assets/gltf/bucket_A.gltf'), scale: 0.7 },
  { id: 'cooler', name: 'Cooler', price: 30, icon: '🧊', path: s('/assets/shop/Tiny_Treats_Pleasant_Picnic_1.0_FREE/Tiny_Treats_Pleasant_Picnic_1.0_FREE/Assets/gltf/cooler.gltf'), scale: 0.7 },
  { id: 'radio', name: 'Radio', price: 20, icon: '📻', path: s('/assets/shop/Tiny_Treats_Pleasant_Picnic_1.0_FREE/Tiny_Treats_Pleasant_Picnic_1.0_FREE/Assets/gltf/radio.gltf'), scale: 0.7 },
  { id: 'picnic_basket_round', name: 'Picnic Basket', price: 25, icon: '🧺', path: s('/assets/shop/Tiny_Treats_Pleasant_Picnic_1.0_FREE/Tiny_Treats_Pleasant_Picnic_1.0_FREE/Assets/gltf/picnic_basket_round.gltf'), scale: 0.7 },
  { id: 'grapes_bowl', name: 'Grapes Bowl', price: 15, icon: '🍇', path: s('/assets/shop/Tiny_Treats_Pleasant_Picnic_1.0_FREE/Tiny_Treats_Pleasant_Picnic_1.0_FREE/Assets/gltf/grapes_bowl.gltf'), scale: 0.7 },
]

export function getShopItems() {
  return SHOP_ITEMS
}

export function buyItem(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId)
  if (!item) return false

  const state = getState()
  if (state.coins < item.price) {
    pushNotification(`💰 Not enough coins! Need ${item.price} 🪙`)
    return false
  }

  if (!spendCoins(item.price)) return false

  const placed = placeDecor(item)
  if (!placed) {
    addCoins(item.price)
    pushNotification('🏪 No free space in the garden!')
    return false
  }

  state.purchasedDecor.push({ itemId, placedIndex: placed.index })
  pushNotification(`🏪 Bought ${item.name}!`)
  return true
}



import { updatePlantGrowth } from './plants.js'

const ACHIEVEMENTS = [
  { id: 's1', name: 'First Focus', desc: 'Complete 1 session', icon: '🌟', threshold: 1, reward: 5, stat: 'totalSessions' },
  { id: 's5', name: 'Getting Started', desc: 'Complete 5 sessions', icon: '🌱', threshold: 5, reward: 15, stat: 'totalSessions' },
  { id: 's20', name: 'Dedicated', desc: 'Complete 20 sessions', icon: '🌿', threshold: 20, reward: 50, stat: 'totalSessions' },
  { id: 'm60', name: 'Focused Hour', desc: 'Accumulate 60 min of focus', icon: '⏰', threshold: 60, reward: 10, stat: 'totalFocusMinutes' },
  { id: 'm300', name: 'Deep Focus', desc: 'Accumulate 300 min of focus', icon: '🧘', threshold: 300, reward: 30, stat: 'totalFocusMinutes' },
  { id: 'p10', name: 'Cat Friend', desc: 'Pet the cat 10 times', icon: '🐱', threshold: 10, reward: 10, stat: 'totalCatPets' },
  { id: 'p50', name: 'Cat Whisperer', desc: 'Pet the cat 50 times', icon: '😺', threshold: 50, reward: 25, stat: 'totalCatPets' },
  { id: 'c100', name: 'Coins Collector', desc: 'Earn 100 coins total', icon: '🪙', threshold: 100, reward: 20, stat: 'totalCoinsEarned' },
  { id: 'c500', name: 'Coins Hoarder', desc: 'Earn 500 coins total', icon: '💰', threshold: 500, reward: 50, stat: 'totalCoinsEarned' },
  { id: 'garden', name: 'Full Garden', desc: 'Use all 6 beds at once', icon: '🌺', threshold: 6, reward: 20, stat: 'maxConcurrentBeds' },
]

const DAILY_POOL = [
  { id: 'd_s1', desc: 'Complete 1 session', icon: '🌱', threshold: 1, reward: 5, stat: 'dailySessions' },
  { id: 'd_s3', desc: 'Complete 3 sessions', icon: '🌿', threshold: 3, reward: 10, stat: 'dailySessions' },
  { id: 'd_m15', desc: 'Focus 15 minutes', icon: '⏱️', threshold: 15, reward: 5, stat: 'dailyFocusMinutes' },
  { id: 'd_m30', desc: 'Focus 30 minutes', icon: '⏰', threshold: 30, reward: 10, stat: 'dailyFocusMinutes' },
  { id: 'd_c3', desc: 'Pet the cat 3 times', icon: '🐱', threshold: 3, reward: 5, stat: 'dailyCatPets' },
  { id: 'd_c5', desc: 'Pet the cat 5 times', icon: '😺', threshold: 5, reward: 8, stat: 'dailyCatPets' },
  { id: 'd_c10', desc: 'Earn 10 coins', icon: '🪙', threshold: 10, reward: 5, stat: 'dailyCoinsEarned' },
  { id: 'd_c30', desc: 'Earn 30 coins', icon: '💰', threshold: 30, reward: 10, stat: 'dailyCoinsEarned' },
]

function generateDailyQuests() {
  const shuffled = [...DAILY_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3).map(q => ({ ...q, done: false }))
}

const state = {
  coins: 0,
  sessions: [],
  stats: {
    totalSessions: 0,
    totalFocusMinutes: 0,
    totalCatPets: 0,
    totalCoinsEarned: 0,
    maxConcurrentBeds: 0,
    dailySessions: 0,
    dailyFocusMinutes: 0,
    dailyCatPets: 0,
    dailyCoinsEarned: 0,
  },
  achievements: ACHIEVEMENTS.map(a => ({ ...a, done: false })),
  dailyQuests: generateDailyQuests(),
  lastDailyDate: new Date().toDateString(),
  notifications: [],
  purchasedDecor: [],
}

let nextId = 1
let notifId = 0

export function getState() { return state }

export function addCoins(amount) {
  state.coins = Math.max(0, state.coins + amount)
}

export function spendCoins(amount) {
  if (state.coins < amount) return false
  state.coins -= amount
  return true
}

export function getReward(session) {
  const minutes = session.totalTime / 60
  return 1 + Math.floor(minutes / 5)
}

export function getSessionForBed(bed) {
  return state.sessions.find(s => s.bed === bed)
}

export function startSession(bed, plantType, taskText, totalMinutes) {
  const session = {
    id: nextId++,
    bed,
    plantType,
    taskText,
    totalTime: totalMinutes * 60,
    elapsedTime: 0,
    complete: false,
  }
  state.sessions.push(session)
  const concurrent = state.sessions.filter(s => !s.complete).length
  if (concurrent > state.stats.maxConcurrentBeds) {
    state.stats.maxConcurrentBeds = concurrent
  }
  return session
}

export function completeSession(session) {
  const reward = getReward(session)
  addCoins(reward)
  const minutes = session.totalTime / 60
  state.stats.totalSessions++
  state.stats.totalFocusMinutes += minutes
  state.stats.totalCoinsEarned += reward
  state.stats.dailySessions++
  state.stats.dailyFocusMinutes += minutes
  state.stats.dailyCoinsEarned += reward
  state.sessions = state.sessions.filter(s => s !== session)
  checkRewards()
  return reward
}

export function recordCatPet() {
  state.stats.totalCatPets++
  state.stats.dailyCatPets++
  checkRewards()
}

export function checkRewards() {
  for (const a of state.achievements) {
    if (a.done) continue
    if (state.stats[a.stat] >= a.threshold) {
      a.done = true
      addCoins(a.reward)
      pushNotification(`${a.icon} ${a.name} completed! +${a.reward} 🪙`)
    }
  }
  for (const q of state.dailyQuests) {
    if (q.done) continue
    if (state.stats[q.stat] >= q.threshold) {
      q.done = true
      addCoins(q.reward)
      pushNotification(`📋 ${q.desc} done! +${q.reward} 🪙`)
    }
  }
}

export function pushNotification(text) {
  const id = ++notifId
  state.notifications.push({ id, text })
  setTimeout(() => {
    state.notifications = state.notifications.filter(n => n.id !== id)
  }, 3000)
}

export function updateGame(delta) {
  const today = new Date().toDateString()
  if (state.lastDailyDate !== today) {
    state.lastDailyDate = today
    state.stats.dailySessions = 0
    state.stats.dailyFocusMinutes = 0
    state.stats.dailyCatPets = 0
    state.stats.dailyCoinsEarned = 0
    state.dailyQuests = generateDailyQuests()
    pushNotification('📋 New daily quests available!')
  }

  for (const session of state.sessions) {
    if (session.complete) continue
    session.elapsedTime += delta
    const progress = Math.min(session.elapsedTime / session.totalTime, 1)
    updatePlantGrowth(session.bed, progress)
    if (session.elapsedTime >= session.totalTime) {
      session.elapsedTime = session.totalTime
      session.complete = true
    }
  }
}

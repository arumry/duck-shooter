// Game configuration constants

export const GAME_CONFIG = {
  // Difficulty settings
  difficulties: {
    easy: { duckSpeed: 3, hitboxMultiplier: 1.3, duration: 90 },
    medium: { duckSpeed: 5, hitboxMultiplier: 1.0, duration: 60 },
    hard: { duckSpeed: 8, hitboxMultiplier: 0.8, duration: 45 },
  },

  // Scoring
  scoring: {
    regularDuck: 100,
    fastDuck: 250,
    bonusDuck: 500,
    comboMultiplier: 1.5,
    comboThreshold: 3,
  },

  // Duck spawning
  spawning: {
    maxDucks: 10,
    spawnInterval: 1500, // ms
    minSpawnInterval: 500,
  },

  // Ammo
  ammo: {
    maxAmmo: 6,
    reloadTime: 1500, // ms
  },

  // Camera
  camera: {
    fov: 60,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 5, z: 20 },
  },

  // Play area bounds
  bounds: {
    minX: -25,
    maxX: 25,
    minY: 0,
    maxY: 20,
    minZ: -10,
    maxZ: 10,
  },
} as const;

export type Difficulty = keyof typeof GAME_CONFIG.difficulties;

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export enum DuckType {
  REGULAR = 'REGULAR',
  FAST = 'FAST',
  BONUS = 'BONUS',
}

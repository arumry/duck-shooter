import * as THREE from 'three';
import { Duck, DuckConfig, FlightPattern } from './Duck';
import { DuckType, GAME_CONFIG, Difficulty } from '../../utils/constants';

export class DuckSpawner {
  private ducks: Duck[] = [];
  private scene: THREE.Scene;
  private spawnTimer: number = 0;
  private spawnInterval: number;
  private baseSpeed: number;

  constructor(scene: THREE.Scene, difficulty: Difficulty = 'medium') {
    this.scene = scene;
    this.spawnInterval = GAME_CONFIG.spawning.spawnInterval;
    this.baseSpeed = GAME_CONFIG.difficulties[difficulty].duckSpeed;
  }

  public setDifficulty(difficulty: Difficulty): void {
    this.baseSpeed = GAME_CONFIG.difficulties[difficulty].duckSpeed;
  }

  public update(deltaTime: number): void {
    // Update spawn timer
    this.spawnTimer += deltaTime * 1000;

    if (
      this.spawnTimer >= this.spawnInterval &&
      this.ducks.length < GAME_CONFIG.spawning.maxDucks
    ) {
      this.spawnDuck();
      this.spawnTimer = 0;
      // Gradually increase spawn rate
      this.spawnInterval = Math.max(
        GAME_CONFIG.spawning.minSpawnInterval,
        this.spawnInterval - 20
      );
    }

    // Update all ducks
    for (const duck of this.ducks) {
      duck.update(deltaTime);
    }

    // Remove dead or out-of-bounds ducks
    this.cleanupDucks();
  }

  private spawnDuck(): void {
    const config = this.generateDuckConfig();
    const duck = new Duck(config);
    this.ducks.push(duck);
    this.scene.add(duck.mesh);
  }

  private generateDuckConfig(): DuckConfig {
    const type = this.randomDuckType();
    const speed = this.getSpeedForType(type);
    const flightPattern = this.randomFlightPattern();
    const { startPosition, direction } = this.getSpawnPositionAndDirection();

    return {
      type,
      speed,
      flightPattern,
      startPosition,
      direction,
    };
  }

  private randomDuckType(): DuckType {
    const rand = Math.random();
    if (rand < 0.05) return DuckType.BONUS; // 5% chance
    if (rand < 0.2) return DuckType.FAST; // 15% chance
    return DuckType.REGULAR; // 80% chance
  }

  private getSpeedForType(type: DuckType): number {
    switch (type) {
      case DuckType.FAST:
        return this.baseSpeed * 1.5;
      case DuckType.BONUS:
        return this.baseSpeed * 1.8;
      default:
        return this.baseSpeed;
    }
  }

  private randomFlightPattern(): FlightPattern {
    const patterns: FlightPattern[] = ['straight', 'wavy', 'diving'];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private getSpawnPositionAndDirection(): {
    startPosition: THREE.Vector3;
    direction: THREE.Vector3;
  } {
    const bounds = GAME_CONFIG.bounds;
    const side = Math.floor(Math.random() * 2); // 0 = left, 1 = right

    let startPosition: THREE.Vector3;
    let direction: THREE.Vector3;

    const y = bounds.minY + 5 + Math.random() * (bounds.maxY - bounds.minY - 5);
    const z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);

    if (side === 0) {
      // Spawn from left
      startPosition = new THREE.Vector3(bounds.minX - 2, y, z);
      direction = new THREE.Vector3(1, (Math.random() - 0.5) * 0.3, 0);
    } else {
      // Spawn from right
      startPosition = new THREE.Vector3(bounds.maxX + 2, y, z);
      direction = new THREE.Vector3(-1, (Math.random() - 0.5) * 0.3, 0);
    }

    return { startPosition, direction };
  }

  private cleanupDucks(): void {
    for (let i = this.ducks.length - 1; i >= 0; i--) {
      const duck = this.ducks[i];
      if (!duck.isAlive || duck.isOutOfBounds()) {
        this.scene.remove(duck.mesh);
        duck.dispose();
        this.ducks.splice(i, 1);
      }
    }
  }

  public getDucks(): Duck[] {
    return this.ducks;
  }

  public getAliveDucks(): Duck[] {
    return this.ducks.filter((d) => d.isAlive && !d.isHit);
  }

  public reset(): void {
    for (const duck of this.ducks) {
      this.scene.remove(duck.mesh);
      duck.dispose();
    }
    this.ducks = [];
    this.spawnTimer = 0;
    this.spawnInterval = GAME_CONFIG.spawning.spawnInterval;
  }
}

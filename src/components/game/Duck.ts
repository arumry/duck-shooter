import * as THREE from 'three';
import { DuckType, GAME_CONFIG } from '../../utils/constants';

export type FlightPattern = 'straight' | 'wavy' | 'diving';

export interface DuckConfig {
  type: DuckType;
  speed: number;
  flightPattern: FlightPattern;
  startPosition: THREE.Vector3;
  direction: THREE.Vector3;
}

export class Duck {
  public mesh: THREE.Mesh;
  public type: DuckType;
  public speed: number;
  public flightPattern: FlightPattern;
  public direction: THREE.Vector3;
  public isAlive: boolean = true;
  public isHit: boolean = false;

  private time: number = 0;
  private waveAmplitude: number = 2;
  private waveFrequency: number = 3;
  private fallSpeed: number = 0;
  private rotationSpeed: THREE.Vector3;

  constructor(config: DuckConfig) {
    this.type = config.type;
    this.speed = config.speed;
    this.flightPattern = config.flightPattern;
    this.direction = config.direction.normalize();

    // Create duck mesh (placeholder box for now)
    const geometry = new THREE.BoxGeometry(1.5, 1, 2);
    const color = this.getColorForType();
    const material = new THREE.MeshStandardMaterial({ color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(config.startPosition);
    this.mesh.castShadow = true;

    this.rotationSpeed = new THREE.Vector3(
      Math.random() * 5,
      Math.random() * 5,
      Math.random() * 5
    );
  }

  private getColorForType(): number {
    switch (this.type) {
      case DuckType.FAST:
        return 0xffd700; // Gold
      case DuckType.BONUS:
        return 0xff00ff; // Magenta/Rainbow placeholder
      default:
        return 0x8b4513; // Brown
    }
  }

  public getPoints(): number {
    switch (this.type) {
      case DuckType.FAST:
        return GAME_CONFIG.scoring.fastDuck;
      case DuckType.BONUS:
        return GAME_CONFIG.scoring.bonusDuck;
      default:
        return GAME_CONFIG.scoring.regularDuck;
    }
  }

  public hit(): void {
    this.isHit = true;
    this.fallSpeed = 0;
  }

  public update(deltaTime: number): void {
    if (!this.isAlive) return;

    this.time += deltaTime;

    if (this.isHit) {
      // Falling animation
      this.fallSpeed += 15 * deltaTime; // Gravity
      this.mesh.position.y -= this.fallSpeed * deltaTime;
      this.mesh.rotation.x += this.rotationSpeed.x * deltaTime;
      this.mesh.rotation.y += this.rotationSpeed.y * deltaTime;
      this.mesh.rotation.z += this.rotationSpeed.z * deltaTime;

      // Check if fallen below ground
      if (this.mesh.position.y < -5) {
        this.isAlive = false;
      }
      return;
    }

    // Normal flight movement
    const movement = this.direction.clone().multiplyScalar(this.speed * deltaTime);

    switch (this.flightPattern) {
      case 'wavy':
        movement.y += Math.sin(this.time * this.waveFrequency) * this.waveAmplitude * deltaTime;
        break;
      case 'diving':
        if (this.time > 1) {
          movement.y -= this.speed * 0.3 * deltaTime;
        }
        break;
      case 'straight':
      default:
        // No modification
        break;
    }

    this.mesh.position.add(movement);

    // Simple wing flap rotation
    this.mesh.rotation.z = Math.sin(this.time * 10) * 0.1;

    // Face direction of movement
    this.mesh.lookAt(this.mesh.position.clone().add(this.direction));
  }

  public isOutOfBounds(): boolean {
    const pos = this.mesh.position;
    const bounds = GAME_CONFIG.bounds;
    return (
      pos.x < bounds.minX - 5 ||
      pos.x > bounds.maxX + 5 ||
      pos.y < bounds.minY - 10 ||
      pos.y > bounds.maxY + 5
    );
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}

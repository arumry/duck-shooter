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

  private wingGroup: THREE.Group;
  private wingAngle: number = 0;

  constructor(config: DuckConfig) {
    this.type = config.type;
    this.speed = config.speed;
    this.flightPattern = config.flightPattern;
    this.direction = config.direction.normalize();

    // Create duck mesh using combined geometries for a low-poly duck shape
    this.mesh = this.createDuckMesh();
    this.mesh.position.copy(config.startPosition);
    this.mesh.castShadow = true;

    // Get wing group reference for animation
    this.wingGroup = this.mesh.getObjectByName('wings') as THREE.Group;

    this.rotationSpeed = new THREE.Vector3(
      Math.random() * 5,
      Math.random() * 5,
      Math.random() * 5
    );
  }

  private createDuckMesh(): THREE.Mesh {
    const duckGroup = new THREE.Group();
    const bodyColor = this.getColorForType();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor });
    const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 }); // Orange beak
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); // Black eyes

    // Body - elongated ellipsoid using scaled sphere
    const bodyGeometry = new THREE.SphereGeometry(0.7, 8, 6);
    bodyGeometry.scale(1.4, 0.9, 1);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 0, 0);
    duckGroup.add(body);

    // Head - smaller sphere
    const headGeometry = new THREE.SphereGeometry(0.45, 8, 6);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0.8, 0.4, 0);
    duckGroup.add(head);

    // Beak - cone
    const beakGeometry = new THREE.ConeGeometry(0.15, 0.5, 4);
    beakGeometry.rotateZ(-Math.PI / 2);
    const beak = new THREE.Mesh(beakGeometry, beakMaterial);
    beak.position.set(1.4, 0.35, 0);
    duckGroup.add(beak);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 6, 4);
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(1.0, 0.55, 0.25);
    duckGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(1.0, 0.55, -0.25);
    duckGroup.add(rightEye);

    // Tail - small cone pointing back
    const tailGeometry = new THREE.ConeGeometry(0.25, 0.6, 4);
    tailGeometry.rotateZ(Math.PI / 2 + 0.3);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(-1.0, 0.2, 0);
    duckGroup.add(tail);

    // Wings group (for animation)
    const wingGroup = new THREE.Group();
    wingGroup.name = 'wings';

    // Create wing shape using a flattened box
    const wingGeometry = new THREE.BoxGeometry(0.6, 0.08, 0.5);

    // Left wing
    const leftWing = new THREE.Mesh(wingGeometry, bodyMaterial);
    leftWing.position.set(0, 0.1, 0.6);
    leftWing.rotation.x = 0.2;
    wingGroup.add(leftWing);

    // Right wing
    const rightWing = new THREE.Mesh(wingGeometry, bodyMaterial);
    rightWing.position.set(0, 0.1, -0.6);
    rightWing.rotation.x = -0.2;
    wingGroup.add(rightWing);

    duckGroup.add(wingGroup);

    // Create a merged geometry for better performance on hit detection
    // but keep the group for visual representation
    const duckMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.2, 1.4), // Bounding box for raycasting
      new THREE.MeshBasicMaterial({ visible: false })
    );

    // Add the visual group as a child
    duckMesh.add(duckGroup);

    return duckMesh;
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

    // Wing flapping animation
    if (this.wingGroup) {
      this.wingAngle = Math.sin(this.time * 15) * 0.5;
      const leftWing = this.wingGroup.children[0];
      const rightWing = this.wingGroup.children[1];
      if (leftWing) leftWing.rotation.x = 0.2 + this.wingAngle;
      if (rightWing) rightWing.rotation.x = -0.2 - this.wingAngle;
    }

    // Slight body bob during flight
    const visualGroup = this.mesh.children[0];
    if (visualGroup) {
      visualGroup.rotation.z = Math.sin(this.time * 8) * 0.05;
    }

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
    // Dispose main mesh geometry and material
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();

    // Dispose all child geometries and materials
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}

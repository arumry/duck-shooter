import * as THREE from 'three';

interface Feather {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
}

export class FeatherParticles {
  private scene: THREE.Scene;
  private feathers: Feather[] = [];
  private featherGeometry: THREE.BufferGeometry;
  private materials: THREE.MeshBasicMaterial[] = [];

  // Pool of reusable feather meshes
  private featherPool: THREE.Mesh[] = [];
  private poolSize: number = 50;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Create feather geometry (elongated ellipse shape)
    this.featherGeometry = this.createFeatherGeometry();

    // Create materials for different feather colors
    const colors = [
      0x8b4513, // Brown
      0xa0522d, // Sienna
      0xd2691e, // Chocolate
      0xffffff, // White
      0xf5f5dc, // Beige
    ];

    colors.forEach((color) => {
      const material = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
      });
      this.materials.push(material);
    });

    // Initialize feather pool
    this.initializePool();
  }

  private createFeatherGeometry(): THREE.BufferGeometry {
    // Create a simple feather-like shape using a plane with custom vertices
    const shape = new THREE.Shape();

    // Feather outline - elongated teardrop shape
    shape.moveTo(0, 0.3);
    shape.quadraticCurveTo(0.08, 0.2, 0.06, 0);
    shape.quadraticCurveTo(0.04, -0.15, 0, -0.3);
    shape.quadraticCurveTo(-0.04, -0.15, -0.06, 0);
    shape.quadraticCurveTo(-0.08, 0.2, 0, 0.3);

    const geometry = new THREE.ShapeGeometry(shape);
    return geometry;
  }

  private initializePool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      const material = this.materials[i % this.materials.length].clone();
      const mesh = new THREE.Mesh(this.featherGeometry, material);
      mesh.visible = false;
      this.scene.add(mesh);
      this.featherPool.push(mesh);
    }
  }

  private getFeatherFromPool(): THREE.Mesh | null {
    for (const mesh of this.featherPool) {
      if (!mesh.visible) {
        return mesh;
      }
    }
    return null;
  }

  public burst(position: THREE.Vector3, count: number = 12): void {
    for (let i = 0; i < count; i++) {
      const mesh = this.getFeatherFromPool();
      if (!mesh) continue;

      // Position at hit location with small random offset
      mesh.position.copy(position);
      mesh.position.x += (Math.random() - 0.5) * 0.5;
      mesh.position.y += (Math.random() - 0.5) * 0.5;
      mesh.position.z += (Math.random() - 0.5) * 0.5;

      // Random initial rotation
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      // Random scale
      const scale = 0.8 + Math.random() * 0.6;
      mesh.scale.set(scale, scale, scale);

      // Reset material opacity
      (mesh.material as THREE.MeshBasicMaterial).opacity = 1;

      mesh.visible = true;

      // Create velocity - burst outward with upward bias initially
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 3 + Math.random() * 4;

      const velocity = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.abs(Math.cos(phi)) * speed * 0.5 + 2, // Upward bias
        Math.sin(phi) * Math.sin(theta) * speed
      );

      // Random rotation speed for tumbling effect
      const rotationSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );

      const maxLifetime = 1.0 + Math.random() * 0.5;

      this.feathers.push({
        mesh,
        velocity,
        rotationSpeed,
        lifetime: maxLifetime,
        maxLifetime,
      });
    }
  }

  public update(deltaTime: number): void {
    const gravity = 9.8;
    const airResistance = 0.98;

    for (let i = this.feathers.length - 1; i >= 0; i--) {
      const feather = this.feathers[i];

      // Update lifetime
      feather.lifetime -= deltaTime;

      if (feather.lifetime <= 0) {
        // Return to pool
        feather.mesh.visible = false;
        this.feathers.splice(i, 1);
        continue;
      }

      // Apply gravity
      feather.velocity.y -= gravity * deltaTime;

      // Apply air resistance (feathers float more)
      feather.velocity.multiplyScalar(airResistance);

      // Add some flutter/drift
      feather.velocity.x += (Math.random() - 0.5) * 2 * deltaTime;
      feather.velocity.z += (Math.random() - 0.5) * 2 * deltaTime;

      // Update position
      feather.mesh.position.add(
        feather.velocity.clone().multiplyScalar(deltaTime)
      );

      // Update rotation (tumbling)
      feather.mesh.rotation.x += feather.rotationSpeed.x * deltaTime;
      feather.mesh.rotation.y += feather.rotationSpeed.y * deltaTime;
      feather.mesh.rotation.z += feather.rotationSpeed.z * deltaTime;

      // Fade out in the last 30% of lifetime
      const lifeRatio = feather.lifetime / feather.maxLifetime;
      if (lifeRatio < 0.3) {
        (feather.mesh.material as THREE.MeshBasicMaterial).opacity =
          lifeRatio / 0.3;
      }
    }
  }

  public dispose(): void {
    // Dispose pool meshes
    for (const mesh of this.featherPool) {
      this.scene.remove(mesh);
      (mesh.material as THREE.Material).dispose();
    }

    // Dispose geometry and materials
    this.featherGeometry.dispose();
    this.materials.forEach((mat) => mat.dispose());

    this.featherPool = [];
    this.feathers = [];
  }
}

import * as THREE from 'three';
import { Duck } from './Duck';
import { GAME_CONFIG, Difficulty } from '../../utils/constants';

export class ShootingSystem {
  private raycaster: THREE.Raycaster;
  private camera: THREE.PerspectiveCamera;
  private hitboxMultiplier: number;

  constructor(camera: THREE.PerspectiveCamera, difficulty: Difficulty = 'medium') {
    this.raycaster = new THREE.Raycaster();
    this.camera = camera;
    this.hitboxMultiplier = GAME_CONFIG.difficulties[difficulty].hitboxMultiplier;
  }

  public setDifficulty(difficulty: Difficulty): void {
    this.hitboxMultiplier = GAME_CONFIG.difficulties[difficulty].hitboxMultiplier;
  }

  public shoot(mousePosition: THREE.Vector2, ducks: Duck[]): Duck | null {
    this.raycaster.setFromCamera(mousePosition, this.camera);

    // Get meshes from alive ducks
    const meshes = ducks
      .filter((d) => d.isAlive && !d.isHit)
      .map((d) => d.mesh);

    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      // Find the duck that was hit
      const hitMesh = intersects[0].object;
      const hitDuck = ducks.find((d) => d.mesh === hitMesh);

      if (hitDuck) {
        // Apply hitbox multiplier for easier/harder hits
        const distance = intersects[0].distance;
        const threshold = 50 * this.hitboxMultiplier;

        if (distance < threshold) {
          return hitDuck;
        }
      }
    }

    return null;
  }

  public getRaycastHitPoint(mousePosition: THREE.Vector2): THREE.Vector3 | null {
    this.raycaster.setFromCamera(mousePosition, this.camera);

    // Create a plane at z=0 for hit point calculation
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hitPoint = new THREE.Vector3();

    if (this.raycaster.ray.intersectPlane(plane, hitPoint)) {
      return hitPoint;
    }

    return null;
  }
}

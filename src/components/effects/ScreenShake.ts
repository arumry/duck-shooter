import * as THREE from 'three';

export class ScreenShake {
  private originalPosition: THREE.Vector3;
  private isShaking: boolean = false;
  private intensity: number = 0;
  private duration: number = 0;
  private timer: number = 0;

  constructor(private camera: THREE.PerspectiveCamera) {
    this.originalPosition = camera.position.clone();
  }

  public trigger(intensity: number = 0.15, duration: number = 0.1): void {
    this.isShaking = true;
    this.intensity = intensity;
    this.duration = duration;
    this.timer = duration;

    // Store the current position as original (in case of overlapping shakes)
    if (!this.isShaking) {
      this.originalPosition.copy(this.camera.position);
    }
  }

  public update(deltaTime: number): void {
    if (!this.isShaking) return;

    this.timer -= deltaTime;

    if (this.timer <= 0) {
      // Reset camera to original position
      this.camera.position.copy(this.originalPosition);
      this.isShaking = false;
      return;
    }

    // Calculate shake factor (diminishes over time)
    const progress = this.timer / this.duration;
    const currentIntensity = this.intensity * progress;

    // Random offset
    const offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
    const offsetY = (Math.random() - 0.5) * 2 * currentIntensity;

    // Apply shake offset to camera
    this.camera.position.x = this.originalPosition.x + offsetX;
    this.camera.position.y = this.originalPosition.y + offsetY;
  }

  public isActive(): boolean {
    return this.isShaking;
  }
}

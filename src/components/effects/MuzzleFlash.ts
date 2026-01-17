import * as THREE from 'three';

export class MuzzleFlash {
  private flash: THREE.Sprite;
  private visible: boolean = false;
  private duration: number = 0.08; // Flash duration in seconds
  private timer: number = 0;

  constructor(private scene: THREE.Scene, private camera: THREE.PerspectiveCamera) {
    // Create a sprite for the muzzle flash
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Draw radial gradient flash
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 200, 100, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 150, 50, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    // Add some "spikes" for the flash
    ctx.strokeStyle = 'rgba(255, 255, 200, 0.8)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const innerRadius = 20;
      const outerRadius = 50 + Math.random() * 14;
      ctx.beginPath();
      ctx.moveTo(64 + Math.cos(angle) * innerRadius, 64 + Math.sin(angle) * innerRadius);
      ctx.lineTo(64 + Math.cos(angle) * outerRadius, 64 + Math.sin(angle) * outerRadius);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.flash = new THREE.Sprite(material);
    this.flash.scale.set(2, 2, 1);
    this.flash.visible = false;
    scene.add(this.flash);
  }

  public trigger(): void {
    this.visible = true;
    this.timer = this.duration;
    this.flash.visible = true;

    // Randomize scale slightly for variation
    const scale = 1.5 + Math.random() * 1;
    this.flash.scale.set(scale, scale, 1);

    // Random rotation
    this.flash.material.rotation = Math.random() * Math.PI * 2;

    // Position at bottom center of screen (gun barrel position)
    this.updatePosition();
  }

  private updatePosition(): void {
    // Position the flash at the bottom center of the viewport
    // Create a position in front of the camera, offset down
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.camera.quaternion);

    // Offset down and slightly forward from camera
    const flashPosition = this.camera.position.clone();
    flashPosition.add(direction.multiplyScalar(5)); // Move forward
    flashPosition.y -= 2; // Move down to simulate gun position

    this.flash.position.copy(flashPosition);
  }

  public update(deltaTime: number): void {
    if (!this.visible) return;

    this.timer -= deltaTime;

    if (this.timer <= 0) {
      this.visible = false;
      this.flash.visible = false;
    } else {
      // Fade out
      const alpha = this.timer / this.duration;
      this.flash.material.opacity = alpha;

      // Slight scale up as it fades
      const scale = (1.5 + Math.random() * 0.5) * (1 + (1 - alpha) * 0.5);
      this.flash.scale.set(scale, scale, 1);
    }
  }

  public dispose(): void {
    this.flash.material.map?.dispose();
    this.flash.material.dispose();
    this.scene.remove(this.flash);
  }
}

import * as THREE from 'three';

export class InputHandler {
  private mousePosition: THREE.Vector2 = new THREE.Vector2();
  private isMouseDown: boolean = false;
  private clickCallbacks: Array<(position: THREE.Vector2) => void> = [];
  private crosshair: HTMLElement | null;

  constructor() {
    this.crosshair = document.getElementById('crosshair');
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Mouse move
    window.addEventListener('mousemove', (event) => {
      this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update crosshair position
      if (this.crosshair) {
        this.crosshair.style.left = `${event.clientX}px`;
        this.crosshair.style.top = `${event.clientY}px`;
      }
    });

    // Mouse click
    window.addEventListener('mousedown', (event) => {
      if (event.button === 0) {
        // Left click only
        this.isMouseDown = true;
        this.triggerClick();
      }
    });

    window.addEventListener('mouseup', (event) => {
      if (event.button === 0) {
        this.isMouseDown = false;
      }
    });

    // Touch support
    window.addEventListener('touchstart', (event) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        this.mousePosition.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mousePosition.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        if (this.crosshair) {
          this.crosshair.style.left = `${touch.clientX}px`;
          this.crosshair.style.top = `${touch.clientY}px`;
        }

        this.triggerClick();
      }
    });

    // Keyboard
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('game:pause'));
      }
      if (event.key === 'r' || event.key === 'R') {
        window.dispatchEvent(new CustomEvent('game:restart'));
      }
    });
  }

  private triggerClick(): void {
    for (const callback of this.clickCallbacks) {
      callback(this.mousePosition.clone());
    }
  }

  public onShoot(callback: (position: THREE.Vector2) => void): void {
    this.clickCallbacks.push(callback);
  }

  public getMousePosition(): THREE.Vector2 {
    return this.mousePosition.clone();
  }

  public isClicking(): boolean {
    return this.isMouseDown;
  }

  public hideCursor(): void {
    document.body.style.cursor = 'none';
    if (this.crosshair) {
      this.crosshair.style.display = 'block';
    }
  }

  public showCursor(): void {
    document.body.style.cursor = 'default';
    if (this.crosshair) {
      this.crosshair.style.display = 'none';
    }
  }
}

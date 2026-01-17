/**
 * Performance monitoring stats display for debugging
 * Shows FPS, frame time, and active object counts
 * Toggle with 'P' key in development
 */
export class PerformanceStats {
  private container: HTMLDivElement;
  private fpsDisplay: HTMLSpanElement;
  private frameTimeDisplay: HTMLSpanElement;
  private objectCountDisplay: HTMLSpanElement;

  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 60;
  private frameTime: number = 16.67;
  private updateInterval: number = 500; // Update display every 500ms

  private isVisible: boolean = false;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'performance-stats';
    this.container.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.75);
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      padding: 8px 12px;
      border-radius: 4px;
      z-index: 10000;
      display: none;
      line-height: 1.6;
    `;

    this.fpsDisplay = document.createElement('span');
    this.frameTimeDisplay = document.createElement('span');
    this.objectCountDisplay = document.createElement('span');

    this.container.innerHTML = `
      <div>FPS: <span id="fps-value">60</span></div>
      <div>Frame: <span id="frame-time-value">16.67</span>ms</div>
      <div>Objects: <span id="object-count-value">0</span></div>
    `;

    document.body.appendChild(this.container);

    this.fpsDisplay = this.container.querySelector('#fps-value')!;
    this.frameTimeDisplay = this.container.querySelector('#frame-time-value')!;
    this.objectCountDisplay = this.container.querySelector('#object-count-value')!;

    // Toggle with 'P' key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'p' || e.key === 'P') {
        this.toggle();
      }
    });
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.container.style.display = this.isVisible ? 'block' : 'none';
  }

  public show(): void {
    this.isVisible = true;
    this.container.style.display = 'block';
  }

  public hide(): void {
    this.isVisible = false;
    this.container.style.display = 'none';
  }

  /**
   * Call this every frame to track performance
   * @param objectCount - Number of active game objects (ducks, particles, etc.)
   */
  public update(objectCount: number = 0): void {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastTime;

    if (elapsed >= this.updateInterval) {
      this.fps = Math.round((this.frameCount / elapsed) * 1000);
      this.frameTime = +(elapsed / this.frameCount).toFixed(2);
      this.frameCount = 0;
      this.lastTime = now;

      if (this.isVisible) {
        // Color code FPS
        if (this.fps >= 55) {
          this.fpsDisplay.style.color = '#0f0'; // Green
        } else if (this.fps >= 30) {
          this.fpsDisplay.style.color = '#ff0'; // Yellow
        } else {
          this.fpsDisplay.style.color = '#f00'; // Red
        }

        this.fpsDisplay.textContent = this.fps.toString();
        this.frameTimeDisplay.textContent = this.frameTime.toString();
        this.objectCountDisplay.textContent = objectCount.toString();
      }
    }
  }

  public getFPS(): number {
    return this.fps;
  }

  public getFrameTime(): number {
    return this.frameTime;
  }

  public dispose(): void {
    this.container.remove();
  }
}

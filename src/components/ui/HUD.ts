import { GAME_CONFIG } from '../../utils/constants';

export class HUD {
  private scoreElement: HTMLElement | null;
  private timerElement: HTMLElement | null;
  private ammoElement: HTMLElement | null;
  private comboElement: HTMLElement | null;

  private score: number = 0;
  private timeRemaining: number = 60;
  private ammo: number = GAME_CONFIG.ammo.maxAmmo;
  private maxAmmo: number = GAME_CONFIG.ammo.maxAmmo;
  private comboCount: number = 0;
  private isReloading: boolean = false;

  constructor() {
    this.scoreElement = document.getElementById('score');
    this.timerElement = document.getElementById('timer');
    this.ammoElement = document.getElementById('ammo');
    this.comboElement = document.getElementById('combo');
  }

  public updateScore(points: number): void {
    // Apply combo multiplier if applicable
    const multiplier = this.getComboMultiplier();
    this.score += Math.floor(points * multiplier);
    this.comboCount++;

    if (this.scoreElement) {
      this.scoreElement.textContent = `Score: ${this.score}`;
    }

    this.updateComboDisplay();
  }

  public getScore(): number {
    return this.score;
  }

  public resetCombo(): void {
    this.comboCount = 0;
    this.updateComboDisplay();
  }

  private getComboMultiplier(): number {
    if (this.comboCount >= GAME_CONFIG.scoring.comboThreshold) {
      return GAME_CONFIG.scoring.comboMultiplier;
    }
    return 1;
  }

  private updateComboDisplay(): void {
    if (this.comboElement) {
      if (this.comboCount >= GAME_CONFIG.scoring.comboThreshold) {
        this.comboElement.textContent = `Combo x${GAME_CONFIG.scoring.comboMultiplier}! (${this.comboCount} hits)`;
        this.comboElement.classList.add('visible');
      } else {
        this.comboElement.classList.remove('visible');
      }
    }
  }

  public updateTimer(seconds: number): void {
    this.timeRemaining = Math.max(0, seconds);
    if (this.timerElement) {
      this.timerElement.textContent = Math.ceil(this.timeRemaining).toString();

      // Add urgency styling when low on time
      if (this.timeRemaining <= 10) {
        this.timerElement.style.color = '#ff4444';
      } else {
        this.timerElement.style.color = 'white';
      }
    }
  }

  public getTimeRemaining(): number {
    return this.timeRemaining;
  }

  public shoot(): boolean {
    if (this.isReloading || this.ammo <= 0) {
      return false;
    }

    this.ammo--;
    this.updateAmmoDisplay();

    if (this.ammo <= 0) {
      this.startReload();
    }

    return true;
  }

  public canShoot(): boolean {
    return !this.isReloading && this.ammo > 0;
  }

  private startReload(): void {
    this.isReloading = true;
    if (this.ammoElement) {
      this.ammoElement.textContent = 'Reloading...';
    }

    setTimeout(() => {
      this.ammo = this.maxAmmo;
      this.isReloading = false;
      this.updateAmmoDisplay();
    }, GAME_CONFIG.ammo.reloadTime);
  }

  private updateAmmoDisplay(): void {
    if (this.ammoElement && !this.isReloading) {
      this.ammoElement.textContent = `Ammo: ${this.ammo}/${this.maxAmmo}`;
    }
  }

  public reset(duration: number): void {
    this.score = 0;
    this.timeRemaining = duration;
    this.ammo = this.maxAmmo;
    this.comboCount = 0;
    this.isReloading = false;

    if (this.scoreElement) this.scoreElement.textContent = 'Score: 0';
    if (this.timerElement) {
      this.timerElement.textContent = duration.toString();
      this.timerElement.style.color = 'white';
    }
    this.updateAmmoDisplay();
    this.updateComboDisplay();
  }

  public show(): void {
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'block';
  }

  public hide(): void {
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';
  }
}

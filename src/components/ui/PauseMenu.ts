import { audioManager } from '../audio/AudioManager';

export class PauseMenu {
  private menuElement: HTMLElement;
  private resumeButton: HTMLElement;
  private restartButton: HTMLElement;
  private quitButton: HTMLElement;

  constructor() {
    this.menuElement = document.getElementById('pause-menu')!;
    this.resumeButton = document.getElementById('resume-btn')!;
    this.restartButton = document.getElementById('restart-btn')!;
    this.quitButton = document.getElementById('quit-btn')!;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.resumeButton.addEventListener('click', () => {
      audioManager.playClick();
      window.dispatchEvent(new CustomEvent('game:pause'));
    });

    this.restartButton.addEventListener('click', () => {
      audioManager.playClick();
      this.hide();
      window.dispatchEvent(new CustomEvent('game:restart'));
    });

    this.quitButton.addEventListener('click', () => {
      audioManager.playClick();
      window.dispatchEvent(new CustomEvent('game:quit'));
    });
  }

  public show(): void {
    this.menuElement.classList.remove('hidden');
  }

  public hide(): void {
    this.menuElement.classList.add('hidden');
  }
}

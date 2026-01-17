import { Difficulty } from '../../utils/constants';
import { audioManager } from '../audio/AudioManager';

export class MainMenu {
  private menuElement: HTMLElement;
  private playButton: HTMLElement;
  private difficultyButtons: NodeListOf<HTMLElement>;
  private highScoreDisplay: HTMLElement;
  private selectedDifficulty: Difficulty = 'medium';

  constructor() {
    this.menuElement = document.getElementById('main-menu')!;
    this.playButton = document.getElementById('play-btn')!;
    this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
    this.highScoreDisplay = document.getElementById('menu-high-score')!;

    this.setupEventListeners();
    this.updateHighScore();
  }

  private setupEventListeners(): void {
    // Play button
    this.playButton.addEventListener('click', () => {
      audioManager.init();
      audioManager.playClick();
      window.dispatchEvent(
        new CustomEvent('menu:play', { detail: { difficulty: this.selectedDifficulty } })
      );
    });

    // Difficulty buttons
    this.difficultyButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        audioManager.init();
        audioManager.playClick();
        this.difficultyButtons.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedDifficulty = btn.dataset.difficulty as Difficulty;
      });
    });
  }

  public updateHighScore(): void {
    const highScore = localStorage.getItem('duckShooter_highScore') || '0';
    this.highScoreDisplay.textContent = `High Score: ${highScore}`;
  }

  public show(): void {
    this.updateHighScore();
    this.menuElement.classList.remove('hidden');
  }

  public hide(): void {
    this.menuElement.classList.add('hidden');
  }

  public getSelectedDifficulty(): Difficulty {
    return this.selectedDifficulty;
  }
}

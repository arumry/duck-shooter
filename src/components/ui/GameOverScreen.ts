import { audioManager } from '../audio/AudioManager';

export class GameOverScreen {
  private screenElement: HTMLElement;
  private finalScoreElement: HTMLElement;
  private highScoreElement: HTMLElement;
  private newHighScoreBadge: HTMLElement;
  private playAgainButton: HTMLElement;
  private menuButton: HTMLElement;

  constructor() {
    this.screenElement = document.getElementById('game-over-screen')!;
    this.finalScoreElement = document.getElementById('final-score')!;
    this.highScoreElement = document.getElementById('game-over-high-score')!;
    this.newHighScoreBadge = document.getElementById('new-high-score-badge')!;
    this.playAgainButton = document.getElementById('play-again-btn')!;
    this.menuButton = document.getElementById('game-over-menu-btn')!;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.playAgainButton.addEventListener('click', () => {
      audioManager.playClick();
      this.hide();
      window.dispatchEvent(new CustomEvent('game:restart'));
    });

    this.menuButton.addEventListener('click', () => {
      audioManager.playClick();
      this.hide();
      window.dispatchEvent(new CustomEvent('game:quit'));
    });
  }

  public show(finalScore: number, highScore: number, isNewHighScore: boolean): void {
    this.finalScoreElement.textContent = finalScore.toString();
    this.highScoreElement.textContent = `High Score: ${highScore}`;

    if (isNewHighScore) {
      this.newHighScoreBadge.classList.remove('hidden');
    } else {
      this.newHighScoreBadge.classList.add('hidden');
    }

    this.screenElement.classList.remove('hidden');
  }

  public hide(): void {
    this.screenElement.classList.add('hidden');
  }
}

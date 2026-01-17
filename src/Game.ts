import * as THREE from 'three';
import { DuckSpawner } from './components/game/DuckSpawner';
import { InputHandler } from './components/game/InputHandler';
import { ShootingSystem } from './components/game/ShootingSystem';
import { HUD } from './components/ui/HUD';
import { MainMenu } from './components/ui/MainMenu';
import { PauseMenu } from './components/ui/PauseMenu';
import { GameOverScreen } from './components/ui/GameOverScreen';
import { MuzzleFlash } from './components/effects/MuzzleFlash';
import { FeatherParticles } from './components/effects/FeatherParticles';
import { ScreenShake } from './components/effects/ScreenShake';
import { audioManager } from './components/audio/AudioManager';
import { PerformanceStats } from './components/debug/PerformanceStats';
import { GameState, GAME_CONFIG, Difficulty } from './utils/constants';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private duckSpawner: DuckSpawner;
  private inputHandler: InputHandler;
  private shootingSystem: ShootingSystem;
  private hud: HUD;
  private mainMenu: MainMenu;
  private pauseMenu: PauseMenu;
  private gameOverScreen: GameOverScreen;
  private muzzleFlash: MuzzleFlash;
  private featherParticles: FeatherParticles;
  private screenShake: ScreenShake;
  private performanceStats: PerformanceStats;

  private state: GameState = GameState.MENU;
  private difficulty: Difficulty = 'medium';
  private clock: THREE.Clock;
  private gameDuration: number;

  constructor() {
    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.setupScene();

    // Camera
    const { fov, near, far, position } = GAME_CONFIG.camera;
    this.camera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
      near,
      far
    );
    this.camera.position.set(position.x, position.y, position.z);
    this.camera.lookAt(0, position.y, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    document.getElementById('app')?.appendChild(this.renderer.domElement);

    // Game systems
    this.duckSpawner = new DuckSpawner(this.scene, this.difficulty);
    this.inputHandler = new InputHandler();
    this.shootingSystem = new ShootingSystem(this.camera, this.difficulty);
    this.hud = new HUD();
    this.mainMenu = new MainMenu();
    this.pauseMenu = new PauseMenu();
    this.gameOverScreen = new GameOverScreen();
    this.muzzleFlash = new MuzzleFlash(this.scene, this.camera);
    this.featherParticles = new FeatherParticles(this.scene);
    this.screenShake = new ScreenShake(this.camera);
    this.performanceStats = new PerformanceStats();

    // Clock
    this.clock = new THREE.Clock();
    this.gameDuration = GAME_CONFIG.difficulties[this.difficulty].duration;

    // Setup event handlers
    this.setupEventHandlers();

    // Handle resize
    window.addEventListener('resize', () => this.onResize());

    // Show menu on load
    this.showMenu();

    // Start render loop
    this.animate();
  }

  private setupScene(): void {
    // Sky gradient background
    const skyColor = new THREE.Color(0x87ceeb);
    const groundColor = new THREE.Color(0x228b22);
    this.scene.background = skyColor;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    this.scene.add(directionalLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: groundColor,
      side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.position.z = -10;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Simple forest silhouette (back plane)
    const forestGeometry = new THREE.PlaneGeometry(100, 20);
    const forestMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a4d1a,
      side: THREE.DoubleSide,
    });
    const forest = new THREE.Mesh(forestGeometry, forestMaterial);
    forest.position.set(0, 8, -30);
    this.scene.add(forest);

    // Add some simple clouds
    this.createClouds();
  }

  private createClouds(): void {
    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });

    for (let i = 0; i < 5; i++) {
      const cloudGroup = new THREE.Group();

      // Create cloud from multiple spheres
      for (let j = 0; j < 4; j++) {
        const radius = 1 + Math.random() * 2;
        const geometry = new THREE.SphereGeometry(radius, 8, 8);
        const sphere = new THREE.Mesh(geometry, cloudMaterial);
        sphere.position.set(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 1,
          (Math.random() - 0.5) * 2
        );
        cloudGroup.add(sphere);
      }

      cloudGroup.position.set(
        (Math.random() - 0.5) * 60,
        15 + Math.random() * 5,
        -20 + Math.random() * 10
      );

      this.scene.add(cloudGroup);
    }
  }

  private setupEventHandlers(): void {
    // Menu play button
    window.addEventListener('menu:play', ((event: CustomEvent<{ difficulty: Difficulty }>) => {
      this.setDifficulty(event.detail.difficulty);
      this.startGame();
    }) as EventListener);

    // Shooting
    this.inputHandler.onShoot((mousePosition) => {
      if (this.state !== GameState.PLAYING) return;
      if (!this.hud.canShoot()) return;

      this.hud.shoot();
      this.muzzleFlash.trigger();
      this.screenShake.trigger(0.12, 0.08); // Subtle shake
      audioManager.playGunshot();

      const hitDuck = this.shootingSystem.shoot(
        mousePosition,
        this.duckSpawner.getDucks()
      );

      if (hitDuck) {
        // Trigger feather burst at duck position
        this.featherParticles.burst(hitDuck.mesh.position.clone());
        hitDuck.hit();
        this.hud.updateScore(hitDuck.getPoints());
        audioManager.playHit();
        audioManager.playQuack();
      } else {
        this.hud.resetCombo();
      }
    });

    // Pause/Resume
    window.addEventListener('game:pause', () => {
      if (this.state === GameState.PLAYING) {
        this.pause();
      } else if (this.state === GameState.PAUSED) {
        this.resume();
      }
    });

    // Restart
    window.addEventListener('game:restart', () => {
      this.restart();
    });

    // Quit to menu
    window.addEventListener('game:quit', () => {
      this.quitToMenu();
    });
  }

  private showMenu(): void {
    this.state = GameState.MENU;
    this.hud.hide();
    this.mainMenu.show();
    this.inputHandler.showCursor();
  }

  private startGame(): void {
    this.state = GameState.PLAYING;
    this.mainMenu.hide();
    this.duckSpawner.reset();
    this.hud.reset(this.gameDuration);
    this.hud.show();
    this.inputHandler.hideCursor();
    this.clock.start();

    // Initialize and resume audio on first user interaction
    audioManager.init();
    audioManager.resume();
  }

  private pause(): void {
    this.state = GameState.PAUSED;
    this.clock.stop();
    this.inputHandler.showCursor();
    this.pauseMenu.show();
  }

  private resume(): void {
    this.state = GameState.PLAYING;
    this.pauseMenu.hide();
    this.clock.start();
    this.inputHandler.hideCursor();
  }

  private restart(): void {
    this.pauseMenu.hide();
    this.duckSpawner.reset();
    this.hud.reset(this.gameDuration);
    this.clock.start();
    this.state = GameState.PLAYING;
    this.inputHandler.hideCursor();
  }

  private quitToMenu(): void {
    this.pauseMenu.hide();
    this.duckSpawner.reset();
    this.showMenu();
  }

  private gameOver(): void {
    this.state = GameState.GAME_OVER;
    this.inputHandler.showCursor();
    audioManager.playGameOver();

    const finalScore = this.hud.getScore();
    const previousHighScore = parseInt(localStorage.getItem('duckShooter_highScore') || '0');
    const isNewHighScore = finalScore > previousHighScore;

    // Save high score if new
    if (isNewHighScore) {
      localStorage.setItem('duckShooter_highScore', finalScore.toString());
    }

    const displayHighScore = Math.max(finalScore, previousHighScore);

    // Show game over screen
    this.gameOverScreen.show(finalScore, displayHighScore, isNewHighScore);
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    if (this.state === GameState.PLAYING) {
      const deltaTime = this.clock.getDelta();

      // Update timer
      const elapsed = this.clock.getElapsedTime();
      const remaining = this.gameDuration - elapsed;
      this.hud.updateTimer(remaining);

      if (remaining <= 0) {
        this.gameOver();
        return;
      }

      // Update duck spawner
      this.duckSpawner.update(deltaTime);

      // Update muzzle flash
      this.muzzleFlash.update(deltaTime);

      // Update feather particles
      this.featherParticles.update(deltaTime);

      // Update screen shake
      this.screenShake.update(deltaTime);
    }

    // Update performance stats (tracks FPS regardless of game state)
    const activeDucks = this.duckSpawner.getDucks().filter(d => d.isActive).length;
    this.performanceStats.update(activeDucks);

    // Render
    this.renderer.render(this.scene, this.camera);
  };

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
    this.gameDuration = GAME_CONFIG.difficulties[difficulty].duration;
    this.duckSpawner.setDifficulty(difficulty);
    this.shootingSystem.setDifficulty(difficulty);
  }
}

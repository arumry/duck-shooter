# 3D Duck Shooting Game - Technical Specification

## Overview

Create an arcade-style 3D duck shooting game using web technologies. Players aim and shoot at ducks flying across the screen within a time limit, earning points for successful hits.

## Technical Stack

### Core Technologies
- **Three.js** - 3D rendering engine
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **HTML5/CSS3** - UI layer

### Optional Enhancements
- **Cannon.js** or **Rapier** - Physics engine for realistic duck movement and hit detection
- **Howler.js** - Audio management
- **GSAP** - UI animations

## Game Mechanics

### Core Gameplay
1. Ducks spawn from random positions at the edges of the screen
2. Ducks fly across the 3D scene in various patterns (straight, wavy, diving)
3. Player aims with mouse/touch and clicks/taps to shoot
4. Successful hits score points and trigger duck falling animation
5. Game ends when timer runs out

### Scoring System
- Regular duck: 100 points
- Fast duck (golden): 250 points
- Bonus duck (rainbow): 500 points
- Combo multiplier: x1.5 for 3+ consecutive hits

### Difficulty Progression
- **Easy**: Slow ducks, generous hit boxes, 90 seconds
- **Medium**: Mixed speeds, standard hit boxes, 60 seconds
- **Hard**: Fast ducks, precise hit boxes, 45 seconds

## 3D Scene Requirements

### Environment
- Sky backdrop with clouds (skybox or gradient)
- Distant forest/mountain silhouette
- Optional: Animated water/pond at bottom of scene

### Duck Model
- Low-poly 3D duck model (< 1000 triangles)
- Wing flapping animation
- Hit reaction animation
- Falling/spinning death animation
- Color variations for different duck types

### Visual Effects
- Muzzle flash on shoot
- Feather particle burst on hit
- Splash effect if duck falls in water
- Crosshair cursor that follows mouse

## Camera & Controls

### Camera Setup
- Fixed perspective camera facing the play area
- Slight depth of field for visual polish
- Screen shake on shoot (subtle)

### Input Controls
- **Mouse**: Aim with cursor position, left-click to shoot
- **Touch**: Tap to aim and shoot simultaneously
- **Keyboard**: ESC to pause, R to restart

## Audio Requirements

### Sound Effects
- Gunshot sound (with slight variation)
- Duck quack (on spawn and hit)
- Feather/impact sound on successful hit
- Splash sound for water landing
- UI click sounds
- Miss/empty shot sound

### Music
- Upbeat background track (loopable)
- Victory jingle
- Game over sound

## User Interface

### HUD Elements
- Score display (top-left)
- Timer countdown (top-center)
- Ammo counter with reload indicator (bottom-right)
- Combo multiplier display (appears on combos)

### Screens
1. **Main Menu**: Title, Play button, Difficulty selector, High scores
2. **Game Screen**: 3D scene with HUD overlay
3. **Pause Menu**: Resume, Restart, Quit options
4. **Game Over Screen**: Final score, High score comparison, Play again button

## Game States

```
MENU -> PLAYING -> PAUSED -> PLAYING
                -> GAME_OVER -> MENU
```

## Performance Targets

- 60 FPS on mid-range devices
- Maximum 10 ducks on screen simultaneously
- Texture atlas for duck variations
- Object pooling for projectiles and particles
- LOD (Level of Detail) not required due to fixed camera

## File Structure

```
/src
  /assets
    /models      # GLB/GLTF duck models
    /textures    # Skybox, environment textures
    /audio       # Sound effects and music
  /components
    /game        # Game logic classes
    /ui          # UI components
    /effects     # Particle systems, shaders
  /utils         # Helpers, constants
  main.ts        # Entry point
  Game.ts        # Main game class
/public
  index.html
```

## Implementation Phases

### Phase 1: Foundation
- Project setup with Vite + Three.js + TypeScript
- Basic 3D scene with skybox
- Camera and mouse input handling
- Simple cube as placeholder duck

### Phase 2: Core Mechanics
- Duck spawning system
- Flight path algorithms
- Raycasting for hit detection
- Scoring system

### Phase 3: Polish
- Duck 3D model integration
- Animations (flapping, falling)
- Particle effects
- Sound integration

### Phase 4: UI & Flow
- All game screens
- HUD implementation
- High score persistence (localStorage)
- Difficulty modes

### Phase 5: Optimization
- Object pooling
- Performance profiling
- Mobile touch support
- Final polish

## Stretch Goals

- Leaderboard with backend integration
- Multiple environments/themes
- Power-ups (slow motion, multi-shot)
- Achievements system
- VR/AR mode using WebXR

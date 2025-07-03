import Phaser from "phaser";

// Global settings object
window.GameSettings = {
  effects: {
    characterRotation: false,
    particleIntensity: 'medium', // 'low', 'medium', 'high', 'extreme'
    backgroundParallax: true,
    characterFloat: true,
    screenShake: true,
    glowEffects: true,
    transitionStyle: 'zoom', // 'zoom', 'fade', 'slide', 'spiral'
    audioVolume: 0.4
  }
};

export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });
    this.characterSprites = [];
    this.backgroundParticles = [];
  }

  preload() {
    const { width, height } = this.sys.game.canvas;
    
    // Create dynamic gradient background
    const gradientBg = this.add.graphics();
    gradientBg.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483, 1);
    gradientBg.fillRect(0, 0, width, height);
    
    // Advanced loading bar with conditional glow effect
    const loadingBarBg = this.add.graphics();
    loadingBarBg.fillStyle(0x000000, 0.4);
    loadingBarBg.fillRoundedRect(width / 4 - 10, height / 2 - 10, width / 2 + 20, 50, 25);
    
    // Conditional outer glow
    let outerGlow = null;
    if (window.GameSettings.effects.glowEffects) {
      outerGlow = this.add.graphics();
      outerGlow.fillStyle(0xffd700, 0.3);
      outerGlow.fillRoundedRect(width / 4 - 15, height / 2 - 15, width / 2 + 30, 60, 30);
    }
    
    const loadingBar = this.add.graphics();
    let progress = 0;
    
    // Animated loading text
    const loadingText = this.add.text(width / 2, height / 2 + 60, '', {
      font: '28px Arial',
      fill: '#ffd700',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        fill: true
      }
    }).setOrigin(0.5, 0);
    
    // Conditional floating particles
    const particles = [];
    const particleCount = this.getParticleCount();
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0xffd700, 0.8);
      particle.fillCircle(0, 0, 2);
      particle.x = width / 4 + Math.random() * (width / 2);
      particle.y = height / 2 + Math.random() * 40 - 20;
      particles.push(particle);
      
      // Animate particles
      this.tweens.add({
        targets: particle,
        x: particle.x + (Math.random() - 0.5) * 100,
        y: particle.y + (Math.random() - 0.5) * 100,
        alpha: { from: 0.8, to: 0 },
        duration: 2000 + Math.random() * 1000,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }
    
    // Loading bar animation
    this.time.addEvent({
      delay: 12,
      repeat: 83,
      callback: () => {
        progress += 0.012;
        loadingBar.clear();
        
        // Main loading bar
        loadingBar.fillStyle(0xffd700, 1);
        loadingBar.fillRoundedRect(width / 4 - 5, height / 2 - 5, (width / 2 + 10) * Math.min(progress, 1), 40, 20);
        
        // Conditional shimmer effect
        if (window.GameSettings.effects.glowEffects) {
          const shimmerPos = (width / 2 + 10) * Math.min(progress, 1);
          loadingBar.fillStyle(0xffffff, 0.6);
          loadingBar.fillRoundedRect(width / 4 - 5 + shimmerPos - 20, height / 2 - 5, 40, 40, 20);
        }
        
        const percentage = Math.floor(progress * 100);
        loadingText.setText(`Loading ${percentage}%`);
      },
      callbackScope: this,
    });
    
    // Remove loading elements
    this.time.delayedCall(1800, () => {
      const elementsToFade = [loadingBar, loadingBarBg, loadingText, ...particles];
      if (outerGlow) elementsToFade.push(outerGlow);
      
      this.tweens.add({
        targets: elementsToFade,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          elementsToFade.forEach(obj => obj.destroy());
        }
      });
    });
    
    // Load assets
    this.load.image("bg", "assets/bg_1.jpg");
    this.load.image("logo", "assets/logo.png");
    this.load.image("puss", "assets/s1_puss.png");
    this.load.image("kitty", "assets/s1_kitty.png");
    this.load.image("perro", "assets/s1_perro.png");
    this.load.image("playnow", "assets/btn_playnow.png");
    this.load.image("settings", "assets/arrow_right.png"); // New settings button
    this.load.audio('bgm', 'assets/bgm.mp3');
  }

  create() {
    // Background music with fade in
    if (!this.sound.get('bgm')) {
      const music = this.sound.add('bgm', {
        loop: true,
        volume: 0
      });
      music.play();
      this.tweens.add({
        targets: music,
        volume: window.GameSettings.effects.audioVolume,
        duration: 2000,
        ease: 'Power2'
      });
    }
    
    const { width, height } = this.sys.game.canvas;
    
    // Background with conditional parallax
    const bg = this.add.image(width / 2, height / 2, "bg").setDisplaySize(width * 1.1, height * 1.1);
    if (window.GameSettings.effects.backgroundParallax) {
      this.tweens.add({
        targets: bg,
        x: width / 2 + 20,
        y: height / 2 - 10,
        duration: 8000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    
    // Conditional background particles
    this.createBackgroundParticles();
    
    // Logo with enhanced entrance
    const logo = this.add.image(width / 2, -100, "logo")
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
      .setDepth(100)
      .setAlpha(0);
    
    this.createLogoAnimation(logo);
    
    // Enhanced characters
    this.createCharacters();
    
    // Settings button
    this.createSettingsButton();
  }
  
  getParticleCount() {
    const intensity = window.GameSettings.effects.particleIntensity;
    const counts = {
      'low': 5,
      'medium': 15,
      'high': 30,
      'extreme': 50
    };
    return counts[intensity] || 15;
  }
  
  createLogoAnimation(logo) {
    const { width } = this.sys.game.canvas;
    
    // Logo entrance with conditional effects
    this.tweens.add({
      targets: logo,
      y: 120,
      scale: 1.2,
      alpha: 1,
      duration: 1200,
      ease: 'Back.easeOut',
      delay: 2000,
      onComplete: () => {
        // Floating animation if enabled
        if (window.GameSettings.effects.characterFloat) {
          this.tweens.add({
            targets: logo,
            y: 110,
            scale: 1.15,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
        
        // Glow effect if enabled
        if (window.GameSettings.effects.glowEffects) {
          this.tweens.add({
            targets: logo,
            alpha: 0.8,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
      }
    });
  }
  
  createCharacters() {
    const { width, height } = this.sys.game.canvas;
    
    const chars = [
      {
        key: "puss",
        targetX: width / 2 + 10,
        targetY: height / 2 + 50,
        scale: 1.4,
        depth: 3,
        color: 0xffd700,
        rotateSpeed: 0.002
      },
      {
        key: "kitty",
        targetX: width / 2 + 110,
        targetY: height / 2 + 80,
        scale: 1.13,
        depth: 2,
        color: 0xff69b4,
        rotateSpeed: -0.0015
      },
      {
        key: "perro",
        targetX: width / 2 + 20,
        targetY: height / 2 + 10,
        scale: 1.05,
        depth: 1,
        color: 0x00ffff,
        rotateSpeed: 0.001
      },
    ];

    let idx = 0;
    this.characterSprites = [];

    const showNextChar = () => {
      if (idx < chars.length) {
        const char = chars[idx];
        const startX = width + 300;
        
        // Create character with conditional shadow
        const shadow = this.add.image(startX + 10, char.targetY + 10, char.key)
          .setAlpha(0)
          .setScale(char.scale)
          .setDepth(char.depth - 0.1)
          .setOrigin(0.5, 0.5)
          .setTint(0x000000);
        
        const sprite = this.add.image(startX, char.targetY, char.key)
          .setAlpha(0)
          .setScale(char.scale)
          .setDepth(char.depth)
          .setOrigin(0.5, 0.5);
        
        this.characterSprites.push({ sprite, shadow, char });
        
        // Entrance animation
        this.tweens.add({
          targets: [sprite, shadow],
          x: char.targetX,
          alpha: 1,
          duration: 800,
          ease: "Back.easeOut",
          onStart: () => {
            // Particle burst effect
            this.createParticleBurst(char.targetX, char.targetY, char.color);
          },
          onComplete: () => {
            // Conditional floating animation
            if (window.GameSettings.effects.characterFloat) {
              this.tweens.add({
                targets: sprite,
                y: char.targetY - 15,
                duration: 2000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
              });
              
              this.tweens.add({
                targets: shadow,
                y: char.targetY + 5,
                duration: 2000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: 200
              });
            }
            
            idx++;
            this.time.delayedCall(200, showNextChar);
          },
        });
      } else {
        this.createPlayButton();
      }
    };
    
    this.time.delayedCall(3500, showNextChar);
    
    // Conditional continuous rotation
    if (window.GameSettings.effects.characterRotation) {
      this.time.addEvent({
        delay: 16,
        repeat: -1,
        callback: () => {
          this.characterSprites.forEach(({ sprite, char }) => {
            sprite.rotation += char.rotateSpeed;
          });
        }
      });
    }
  }
  
  createBackgroundParticles() {
    const { width, height } = this.sys.game.canvas;
    const particleCount = Math.floor(this.getParticleCount() * 0.75);
    
    for (let i = 0; i < particleCount; i++) {
      const orb = this.add.graphics();
      orb.fillStyle(0xffd700, 0.1 + Math.random() * 0.2);
      orb.fillCircle(0, 0, 5 + Math.random() * 10);
      orb.x = Math.random() * width;
      orb.y = Math.random() * height;
      orb.setDepth(-1);
      
      this.backgroundParticles.push(orb);
      
      this.tweens.add({
        targets: orb,
        x: orb.x + (Math.random() - 0.5) * 200,
        y: orb.y + (Math.random() - 0.5) * 200,
        alpha: { from: 0.3, to: 0.1 },
        duration: 4000 + Math.random() * 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  createParticleBurst(x, y, color) {
    const intensity = window.GameSettings.effects.particleIntensity;
    const particleCounts = {
      'low': 6,
      'medium': 12,
      'high': 20,
      'extreme': 30
    };
    const particleCount = particleCounts[intensity] || 12;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(color, 0.8);
      particle.fillCircle(0, 0, 3);
      particle.x = x;
      particle.y = y;
      particle.setDepth(10);
      
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 50 + Math.random() * 50;
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;
      
      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: { from: 1, to: 0 },
        duration: 800,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }
  
  createPlayButton() {
    const { width, height } = this.sys.game.canvas;
    
    // Conditional button glow
    let buttonGlow = null;
    if (window.GameSettings.effects.glowEffects) {
      buttonGlow = this.add.graphics();
      buttonGlow.fillStyle(0xffd700, 0.3);
      buttonGlow.fillCircle(width / 2, height - 100, 80);
      buttonGlow.setDepth(5);
      
      this.tweens.add({
        targets: buttonGlow,
        alpha: { from: 0.3, to: 0.1 },
        scale: { from: 1, to: 1.5 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    
    const playBtn = this.add.image(width / 2, height + 100, "playnow")
      .setInteractive({ useHandCursor: true })
      .setScale(0.8)
      .setDepth(10)
      .setAlpha(0);
    
    // Button entrance
    this.tweens.add({
      targets: playBtn,
      y: height - 100,
      scale: 1,
      alpha: 1,
      duration: 1000,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        if (window.GameSettings.effects.characterFloat) {
          this.tweens.add({
            targets: playBtn,
            y: height - 110,
            scale: 1.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
        }
      }
    });
    
    // Enhanced hover effects
    playBtn.on("pointerover", () => {
      this.tweens.add({
        targets: playBtn,
        scale: 1.2,
        duration: 200,
        ease: 'Back.easeOut',
      });
      playBtn.setTint(0xffffaa);
      
      if (window.GameSettings.effects.particleIntensity !== 'low') {
        this.createParticleBurst(playBtn.x, playBtn.y, 0xffd700);
      }
    });
    
    playBtn.on("pointerout", () => {
      this.tweens.add({
        targets: playBtn,
        scale: window.GameSettings.effects.characterFloat ? 1.05 : 1,
        duration: 200,
        ease: 'Back.easeOut',
      });
      playBtn.clearTint();
    });
    
    playBtn.on("pointerdown", () => {
      this.handlePlayButtonClick(playBtn);
    });
  }
  
  handlePlayButtonClick(playBtn) {
    const { width, height } = this.sys.game.canvas;
    
    // Screen shake effect
    if (window.GameSettings.effects.screenShake) {
      this.cameras.main.shake(200, 0.01);
    }
    
    // Click effect
    this.tweens.add({
      targets: playBtn,
      scale: 0.95,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
    
    // Transition effects based on settings
    const transitionStyle = window.GameSettings.effects.transitionStyle;
    
    switch (transitionStyle) {
      case 'zoom':
        this.cameras.main.zoomTo(1.1, 500);
        this.cameras.main.fadeOut(500, 0, 0, 0);
        break;
      case 'fade':
        this.cameras.main.fadeOut(800, 0, 0, 0);
        break;
      case 'slide':
        this.cameras.main.pan(width * 2, height / 2, 800, 'Power2');
        this.cameras.main.fadeOut(800, 0, 0, 0);
        break;
      case 'spiral':
        this.cameras.main.rotateTo(Math.PI * 2, true, 800);
        this.cameras.main.zoomTo(0.1, 800);
        this.cameras.main.fadeOut(800, 0, 0, 0);
        break;
    }
    
    // Screen flash effect
    if (window.GameSettings.effects.glowEffects) {
      const flash = this.add.graphics();
      flash.fillStyle(0xffffff, 0.5);
      flash.fillRect(0, 0, width, height);
      flash.setDepth(1000);
      
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => flash.destroy()
      });
    }
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start("QuizScene");
    });
  }
  
  createSettingsButton() {
    const { width, height } = this.sys.game.canvas;
    
    // Settings button in top-right corner
    const settingsBtn = this.add.image(width - 60, 60, "settings")
      .setInteractive({ useHandCursor: true })
      .setScale(0.6)
      .setDepth(100)
      .setAlpha(0.8);
    
    // Hover effects
    settingsBtn.on("pointerover", () => {
      this.tweens.add({
        targets: settingsBtn,
        scale: 0.7,
        alpha: 1,
        duration: 200,
        ease: 'Back.easeOut',
      });
    });
    
    settingsBtn.on("pointerout", () => {
      this.tweens.add({
        targets: settingsBtn,
        scale: 0.6,
        alpha: 0.8,
        duration: 200,
        ease: 'Back.easeOut',
      });
    });
    
    settingsBtn.on("pointerdown", () => {
      this.scene.launch("SettingsScene");
      this.scene.pause();
    });
  }
}

// Settings Scene
export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: "SettingsScene" });
  }
  
  create() {
    const { width, height } = this.sys.game.canvas;
    
    // Semi-transparent background
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive();
    
    // Settings panel
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.95);
    panel.fillRoundedRect(width / 2 - 250, height / 2 - 200, 500, 400, 20);
    panel.lineStyle(3, 0xffd700, 1);
    panel.strokeRoundedRect(width / 2 - 250, height / 2 - 200, 500, 400, 20);
    
    // Title
    this.add.text(width / 2, height / 2 - 160, 'SETTINGS', {
      font: '32px Arial',
      fill: '#ffd700',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    
    // Settings options
    const settings = [
      { key: 'characterRotation', label: 'Character Rotation', type: 'boolean' },
      { key: 'particleIntensity', label: 'Particle Effects', type: 'select', options: ['low', 'medium', 'high', 'extreme'] },
      { key: 'backgroundParallax', label: 'Background Parallax', type: 'boolean' },
      { key: 'characterFloat', label: 'Character Float', type: 'boolean' },
      { key: 'screenShake', label: 'Screen Shake', type: 'boolean' },
      { key: 'glowEffects', label: 'Glow Effects', type: 'boolean' },
      { key: 'transitionStyle', label: 'Transition Style', type: 'select', options: ['zoom', 'fade', 'slide', 'spiral'] }
    ];
    
    const startY = height / 2 - 120;
    const spacing = 35;
    
    settings.forEach((setting, index) => {
      const y = startY + index * spacing;
      
      // Label
      this.add.text(width / 2 - 200, y, setting.label, {
        font: '18px Arial',
        fill: '#ffffff'
      });
      
      if (setting.type === 'boolean') {
        this.createToggle(width / 2 + 100, y, setting.key);
      } else if (setting.type === 'select') {
        this.createSelect(width / 2 + 100, y, setting.key, setting.options);
      }
    });
    
    // Close button
    const closeBtn = this.add.text(width / 2, height / 2 + 150, 'CLOSE', {
      font: '24px Arial',
      fill: '#ffd700',
      fontWeight: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerdown', () => {
      this.scene.resume("StartScene");
      this.scene.stop();
    });
    
    // Apply button
    const applyBtn = this.add.text(width / 2, height / 2 + 120, 'APPLY & RESTART', {
      font: '20px Arial',
      fill: '#00ff00',
      fontWeight: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    applyBtn.on('pointerdown', () => {
      this.scene.stop();
      this.scene.start("StartScene");
    });
  }
  
  createToggle(x, y, key) {
    const isOn = window.GameSettings.effects[key];
    
    const toggle = this.add.graphics();
    toggle.fillStyle(isOn ? 0x00ff00 : 0x666666, 1);
    toggle.fillRoundedRect(x, y - 10, 60, 20, 10);
    toggle.setInteractive(new Phaser.Geom.Rectangle(x, y - 10, 60, 20), Phaser.Geom.Rectangle.Contains);
    
    const knob = this.add.graphics();
    knob.fillStyle(0xffffff, 1);
    knob.fillCircle(isOn ? x + 45 : x + 15, y, 8);
    
    toggle.on('pointerdown', () => {
      window.GameSettings.effects[key] = !window.GameSettings.effects[key];
      const newIsOn = window.GameSettings.effects[key];
      
      toggle.clear();
      toggle.fillStyle(newIsOn ? 0x00ff00 : 0x666666, 1);
      toggle.fillRoundedRect(x, y - 10, 60, 20, 10);
      
      knob.clear();
      knob.fillStyle(0xffffff, 1);
      knob.fillCircle(newIsOn ? x + 45 : x + 15, y, 8);
    });
  }
  
  createSelect(x, y, key, options) {
    const currentValue = window.GameSettings.effects[key];
    const currentIndex = options.indexOf(currentValue);
    
    const selectBg = this.add.graphics();
    selectBg.fillStyle(0x333333, 1);
    selectBg.fillRoundedRect(x, y - 12, 120, 24, 5);
    selectBg.setInteractive(new Phaser.Geom.Rectangle(x, y - 12, 120, 24), Phaser.Geom.Rectangle.Contains);
    
    const selectText = this.add.text(x + 60, y, currentValue.toUpperCase(), {
      font: '16px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    selectBg.on('pointerdown', () => {
      const nextIndex = (currentIndex + 1) % options.length;
      const nextValue = options[nextIndex];
      window.GameSettings.effects[key] = nextValue;
      selectText.setText(nextValue.toUpperCase());
    });
  }
}
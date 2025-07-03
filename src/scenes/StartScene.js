import Phaser from "phaser";

export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });
  }

  preload() {
    const { width, height } = this.sys.game.canvas;
    
    // Create dynamic gradient background
    const gradientBg = this.add.graphics();
    gradientBg.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483, 1);
    gradientBg.fillRect(0, 0, width, height);
    
    // Advanced loading bar with glow effect
    const loadingBarBg = this.add.graphics();
    loadingBarBg.fillStyle(0x000000, 0.4);
    loadingBarBg.fillRoundedRect(width / 4 - 10, height / 2 - 10, width / 2 + 20, 50, 25);
    
    // Outer glow
    const outerGlow = this.add.graphics();
    outerGlow.fillStyle(0xffd700, 0.3);
    outerGlow.fillRoundedRect(width / 4 - 15, height / 2 - 15, width / 2 + 30, 60, 30);
    
    const loadingBar = this.add.graphics();
    let progress = 0;
    
    // Animated loading text with typewriter effect
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
    
    // Floating particles around loading bar
    const particles = [];
    for (let i = 0; i < 20; i++) {
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
    
    // Loading bar animation with shimmer effect
    this.time.addEvent({
      delay: 12,
      repeat: 83,
      callback: () => {
        progress += 0.012;
        loadingBar.clear();
        
        // Main loading bar
        loadingBar.fillStyle(0xffd700, 1);
        loadingBar.fillRoundedRect(width / 4 - 5, height / 2 - 5, (width / 2 + 10) * Math.min(progress, 1), 40, 20);
        
        // Shimmer effect
        const shimmerPos = (width / 2 + 10) * Math.min(progress, 1);
        loadingBar.fillStyle(0xffffff, 0.6);
        loadingBar.fillRoundedRect(width / 4 - 5 + shimmerPos - 20, height / 2 - 5, 40, 40, 20);
        
        // Update text with percentage
        const percentage = Math.floor(progress * 100);
        loadingText.setText(`Loading ${percentage}%`);
      },
      callbackScope: this,
    });
    
    // Remove loading elements after animation
    this.time.delayedCall(1800, () => {
      this.tweens.add({
        targets: [loadingBar, loadingBarBg, loadingText, outerGlow, ...particles],
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          [loadingBar, loadingBarBg, loadingText, outerGlow, ...particles].forEach(obj => obj.destroy());
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
        volume: 0.4,
        duration: 2000,
        ease: 'Power2'
      });
    }
    
    const { width, height } = this.sys.game.canvas;
    
    // Background with parallax effect
    const bg = this.add.image(width / 2, height / 2, "bg").setDisplaySize(width * 1.1, height * 1.1);
    this.tweens.add({
      targets: bg,
      x: width / 2 + 20,
      y: height / 2 - 10,
      duration: 8000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Dynamic background particles
    this.createBackgroundParticles();
    
    // Logo with dramatic entrance
    const logo = this.add.image(width / 2, -100, "logo")
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
      .setDepth(100)
      .setAlpha(0);
    
    // Logo entrance animation
    this.tweens.add({
      targets: logo,
      y: 120,
      scale: 1.2,
      alpha: 1,
      duration: 1200,
      ease: 'Back.easeOut',
      delay: 2000,
      onComplete: () => {
        // Logo floating animation
        this.tweens.add({
          targets: logo,
          y: 110,
          scale: 1.15,
          duration: 3000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        
        // Logo glow effect
        this.tweens.add({
          targets: logo,
          alpha: 0.8,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });
    
    // Characters with enhanced animations
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
    const characterSprites = [];

    const showNextChar = () => {
      if (idx < chars.length) {
        const char = chars[idx];
        const startX = width + 300;
        
        // Create character with shadow
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
        
        characterSprites.push({ sprite, shadow, char });
        
        // Entrance animation with rotation and particles
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
            // Idle floating animation
            this.tweens.add({
              targets: sprite,
              y: char.targetY - 15,
              duration: 2000 + Math.random() * 1000,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
            
            // Shadow follows with delay
            this.tweens.add({
              targets: shadow,
              y: char.targetY + 5,
              duration: 2000 + Math.random() * 1000,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
              delay: 200
            });
            
            idx++;
            this.time.delayedCall(200, showNextChar);
          },
        });
      } else {
        // Show Play Now button with spectacular effects
        this.createPlayButton();
      }
    };
    
    // Start character animation after logo
    this.time.delayedCall(3500, showNextChar);
    
    // Add continuous character rotation
    this.time.addEvent({
      delay: 16,
      repeat: -1,
      callback: () => {
        characterSprites.forEach(({ sprite, char }) => {
          sprite.rotation += char.rotateSpeed;
        });
      }
    });
  }
  
  createBackgroundParticles() {
    const { width, height } = this.sys.game.canvas;
    
    // Create floating orbs
    for (let i = 0; i < 15; i++) {
      const orb = this.add.graphics();
      orb.fillStyle(0xffd700, 0.1 + Math.random() * 0.2);
      orb.fillCircle(0, 0, 5 + Math.random() * 10);
      orb.x = Math.random() * width;
      orb.y = Math.random() * height;
      orb.setDepth(-1);
      
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
    const particleCount = 12;
    
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
    
    // Button background glow
    const buttonGlow = this.add.graphics();
    buttonGlow.fillStyle(0xffd700, 0.3);
    buttonGlow.fillCircle(width / 2, height - 100, 80);
    buttonGlow.setDepth(5);
    
    // Pulsing glow animation
    this.tweens.add({
      targets: buttonGlow,
      alpha: { from: 0.3, to: 0.1 },
      scale: { from: 1, to: 1.5 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Play button with entrance animation
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
        // Continuous floating animation
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
      
      // Hover particle effect
      this.createParticleBurst(playBtn.x, playBtn.y, 0xffd700);
    });
    
    playBtn.on("pointerout", () => {
      this.tweens.add({
        targets: playBtn,
        scale: 1.05,
        duration: 200,
        ease: 'Back.easeOut',
      });
      playBtn.clearTint();
    });
    
    playBtn.on("pointerdown", () => {
      // Click effect
      this.tweens.add({
        targets: playBtn,
        scale: 0.95,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
      
      // Screen flash effect
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
      
      // Transition with zoom effect
      this.cameras.main.zoomTo(1.1, 500);
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start("QuizScene");
      });
    });
  }
}
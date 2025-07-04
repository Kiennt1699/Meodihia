import Phaser from "phaser";

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
    this.dynamicElements = []; // Để theo dõi các elements cần cập nhật
    this.musicInstance = null;
    this.settingsUpdateTimer = null;
    this.lastSettings = null; // Lưu trữ settings cũ để so sánh
  }

  preload() {
    const { width, height } = this.sys.game.canvas;
    
    // Create dynamic gradient background
    const gradientBg = this.add.graphics();
    gradientBg.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483, 1);
    gradientBg.fillRect(0, 0, width, height);
    
    // Advanced loading bar với hiệu ứng phụ thuộc settings
    this.createLoadingBar();
    
    // Load assets
    this.load.image("bg", "assets/bg_1.jpg");
    this.load.image("logo", "assets/logo.png");
    this.load.image("puss", "assets/s1_puss.png");
    this.load.image("kitty", "assets/s1_kitty.png");
    this.load.image("perro", "assets/s1_perro.png");
    this.load.image("playnow", "assets/btn_playnow.png");
    this.load.image("settings", "assets/arrow_right.png");
    this.load.audio('bgm', 'assets/bgm.mp3');
    this.load.audio('ui-click', 'assets/ui-click.mp3'); // Để phối hợp với SettingsScene
  }

  createLoadingBar() {
    const { width, height } = this.sys.game.canvas;
    
    // Loading bar background
    const loadingBarBg = this.add.graphics();
    loadingBarBg.fillStyle(0x000000, 0.4);
    loadingBarBg.fillRoundedRect(width / 4 - 10, height / 2 - 10, width / 2 + 20, 50, 25);
    
    // Conditional outer glow dựa theo settings
    let outerGlow = null;
    if (window.GameSettings.effects.glowEffects) {
      outerGlow = this.add.graphics();
      outerGlow.fillStyle(0xffd700, 0.3);
      outerGlow.fillRoundedRect(width / 4 - 15, height / 2 - 15, width / 2 + 30, 60, 30);
      
      // Thêm hiệu ứng nhấp nháy cho glow
      this.tweens.add({
        targets: outerGlow,
        alpha: { from: 0.3, to: 0.1 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    
    const loadingBar = this.add.graphics();
    let progress = 0;
    
    const loadingText = this.add.text(width / 2, height / 2 + 60, '', {
      font: '28px MinionPro',
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
    
    // Conditional loading particles dựa theo particle intensity
    const particles = [];
    const particleCount = this.getParticleCount();
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0xffd700, 0.8);
      particle.fillCircle(0, 0, 2);
      particle.x = width / 4 + Math.random() * (width / 2);
      particle.y = height / 2 + Math.random() * 40 - 20;
      particles.push(particle);
      
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
    
    this.time.addEvent({
      delay: 12,
      repeat: 83,
      callback: () => {
        progress += 0.012;
        loadingBar.clear();
        
        loadingBar.fillStyle(0xffd700, 1);
        loadingBar.fillRoundedRect(width / 4 - 5, height / 2 - 5, (width / 2 + 10) * Math.min(progress, 1), 40, 20);
        
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
  }

  create() {
    this.lastSettings = JSON.parse(JSON.stringify(window.GameSettings.effects));
    
    this.initializeMusic();
    
    const { width, height } = this.sys.game.canvas;
    
    this.createBackground();
    
    this.createBackgroundParticles();
    
    this.createLogo();
    
    this.createCharacters();
    
    this.createSettingsButton();
    
    // Lắng nghe sự kiện khi quay lại từ SettingsScene
    this.events.on('wake', this.onWakeFromSettings, this);
    
    // Thiết lập timer để kiểm tra thay đổi settings liên tục
    this.setupSettingsWatcher();
  }
  
  // Thiết lập watcher để theo dõi thay đổi settings real-time
  setupSettingsWatcher() {
    this.settingsUpdateTimer = this.time.addEvent({
      delay: 100, // Kiểm tra mỗi 100ms
      repeat: -1,
      callback: () => {
        if (this.hasSettingsChanged()) {
          this.updateAllEffects();
          this.lastSettings = JSON.parse(JSON.stringify(window.GameSettings.effects));
        }
      }
    });
  }
  
  // Kiểm tra xem settings có thay đổi không
  hasSettingsChanged() {
    if (!this.lastSettings) return false;
    
    const currentSettings = window.GameSettings.effects;
    
    // So sánh từng thuộc tính
    for (let key in currentSettings) {
      if (currentSettings[key] !== this.lastSettings[key]) {
        return true;
      }
    }
    
    return false;
  }
  
  initializeMusic() {
    if (!this.sound.get('bgm')) {
      this.musicInstance = this.sound.add('bgm', {
        loop: true,
        volume: 0
      });
      this.musicInstance.play();
      this.tweens.add({
        targets: this.musicInstance,
        volume: window.GameSettings.effects.audioVolume,
        duration: 2000,
        ease: 'Power2'
      });
    } else {
      this.musicInstance = this.sound.get('bgm');
      // Cập nhật volume theo settings
      this.musicInstance.setVolume(window.GameSettings.effects.audioVolume);
    }
  }
  
  createBackground() {
    const { width, height } = this.sys.game.canvas;
    
    this.background = this.add.image(width / 2, height / 2, "bg").setDisplaySize(width * 1.1, height * 1.1);
    this.dynamicElements.push(this.background);
    
    this.updateBackgroundParallax();
  }
  
  updateBackgroundParallax() {
    // Dừng tween cũ nếu có
    this.tweens.killTweensOf(this.background);
    
    if (window.GameSettings.effects.backgroundParallax) {
      this.tweens.add({
        targets: this.background,
        x: this.sys.game.canvas.width / 2 + 20,
        y: this.sys.game.canvas.height / 2 - 10,
        duration: 8000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      // Reset position nếu parallax bị tắt
      this.background.setPosition(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2);
    }
  }
  
  createLogo() {
    const { width } = this.sys.game.canvas;
    
    this.logo = this.add.image(width / 2, -100, "logo")
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
      .setDepth(100)
      .setAlpha(0);
    
    this.dynamicElements.push(this.logo);
    this.createLogoAnimation();
  }
  
  createLogoAnimation() {
    const { width } = this.sys.game.canvas;
    
    // Logo entrance với conditional effects
    this.tweens.add({
      targets: this.logo,
      y: 120,
      scale: 1.2,
      alpha: 1,
      duration: 1200,
      ease: 'Back.easeOut',
      delay: 2000,
      onComplete: () => {
        this.updateLogoEffects();
      }
    });
  }
  
  updateLogoEffects() {
    if (!this.logo) return;
    
    // Dừng tất cả tween cũ của logo
    this.tweens.killTweensOf(this.logo);
    
    // Floating animation nếu được bật
    if (window.GameSettings.effects.characterFloat) {
      this.tweens.add({
        targets: this.logo,
        y: 110,
        scale: 1.15,
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      // Reset về vị trí cố định
      this.tweens.add({
        targets: this.logo,
        y: 120,
        scale: 1.2,
        duration: 300,
        ease: 'Power2'
      });
    }
    
    // Glow effect nếu được bật
    if (window.GameSettings.effects.glowEffects) {
      this.tweens.add({
        targets: this.logo,
        alpha: { from: 1, to: 0.8 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      // Reset alpha về 1
      this.tweens.add({
        targets: this.logo,
        alpha: 1,
        duration: 300,
        ease: 'Power2'
      });
    }
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
        
        // Create character với conditional shadow
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
            this.updateCharacterEffects(sprite, shadow, char);
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
    this.setupCharacterRotation();
  }
  
  updateCharacterEffects(sprite, shadow, char) {
    if (!sprite || !shadow) return;
    
    // Dừng tween cũ
    this.tweens.killTweensOf([sprite, shadow]);
    
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
    } else {
      // Reset về vị trí cố định
      this.tweens.add({
        targets: sprite,
        y: char.targetY,
        duration: 300,
        ease: 'Power2'
      });
      this.tweens.add({
        targets: shadow,
        y: char.targetY + 10,
        duration: 300,
        ease: 'Power2'
      });
    }
  }
  
  setupCharacterRotation() {
    // Dừng rotation event cũ nếu có
    if (this.rotationEvent) {
      this.rotationEvent.destroy();
      this.rotationEvent = null;
    }
    
    if (window.GameSettings.effects.characterRotation) {
      this.rotationEvent = this.time.addEvent({
        delay: 16,
        repeat: -1,
        callback: () => {
          this.characterSprites.forEach(({ sprite, char }) => {
            if (sprite && sprite.active) {
              sprite.rotation += char.rotateSpeed;
            }
          });
        }
      });
    } else {
      // Reset rotation về 0
      this.characterSprites.forEach(({ sprite }) => {
        if (sprite && sprite.active) {
          this.tweens.add({
            targets: sprite,
            rotation: 0,
            duration: 500,
            ease: 'Power2'
          });
        }
      });
    }
  }
  
  createBackgroundParticles() {
    // Xóa particles cũ
    this.backgroundParticles.forEach(particle => {
      if (particle && particle.active) {
        particle.destroy();
      }
    });
    this.backgroundParticles = [];
    
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
        onComplete: () => {
          if (particle && particle.active) {
            particle.destroy();
          }
        }
      });
    }
  }
  
  createPlayButton() {
    const { width, height } = this.sys.game.canvas;
    
    // Conditional button glow
    this.updateButtonGlow();
    
    this.playBtn = this.add.image(width / 2, height + 100, "playnow")
      .setInteractive({ useHandCursor: true })
      .setScale(0.8)
      .setDepth(10)
      .setAlpha(0);
    
    this.dynamicElements.push(this.playBtn);
    
    this.tweens.add({
      targets: this.playBtn,
      y: height - 100,
      scale: 1,
      alpha: 1,
      duration: 1000,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.updatePlayButtonEffects();
      }
    });
    
    // Enhanced hover effects
    this.playBtn.on("pointerover", () => {
      this.tweens.add({
        targets: this.playBtn,
        scale: 1.2,
        duration: 200,
        ease: 'Back.easeOut',
      });
      this.playBtn.setTint(0xffffaa);
      
      if (window.GameSettings.effects.particleIntensity !== 'low') {
        this.createParticleBurst(this.playBtn.x, this.playBtn.y, 0xffd700);
      }
    });
    
    this.playBtn.on("pointerout", () => {
      this.tweens.add({
        targets: this.playBtn,
        scale: window.GameSettings.effects.characterFloat ? 1.05 : 1,
        duration: 200,
        ease: 'Back.easeOut',
      });
      this.playBtn.clearTint();
    });
    
    this.playBtn.on("pointerdown", () => {
      this.handlePlayButtonClick();
    });
  }
  
  updatePlayButtonEffects() {
    if (!this.playBtn || !this.playBtn.active) return;
    
    // Dừng tween cũ
    this.tweens.killTweensOf(this.playBtn);
    
    if (window.GameSettings.effects.characterFloat) {
      this.tweens.add({
        targets: this.playBtn,
        y: this.sys.game.canvas.height - 110,
        scale: 1.05,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else {
      this.tweens.add({
        targets: this.playBtn,
        y: this.sys.game.canvas.height - 100,
        scale: 1,
        duration: 300,
        ease: 'Power2'
      });
    }
  }
  
  handlePlayButtonClick() {
    const { width, height } = this.sys.game.canvas;
    
    // Screen shake effect
    if (window.GameSettings.effects.screenShake) {
      this.cameras.main.shake(200, 0.01);
    }
    
    // Click effect
    this.tweens.add({
      targets: this.playBtn,
      scale: 0.95,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
    
    this.applyTransitionEffect();
    
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
        onComplete: () => {
          if (flash && flash.active) {
            flash.destroy();
          }
        }
      });
    }
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start("QuizScene");
    });
  }
  
  applyTransitionEffect() {
    const { width, height } = this.sys.game.canvas;
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
  }
  
  createSettingsButton() {
    const { width, height } = this.sys.game.canvas;
    
    this.settingsBtn = this.add.image(width - 60, 60, "settings")
      .setInteractive({ useHandCursor: true })
      .setScale(0.6)
      .setDepth(100)
      .setAlpha(0.8);
    
    this.settingsBtn.on("pointerover", () => {
      this.tweens.add({
        targets: this.settingsBtn,
        scale: 0.7,
        alpha: 1,
        duration: 200,
        ease: 'Back.easeOut',
      });
    });
    
    this.settingsBtn.on("pointerout", () => {
      this.tweens.add({
        targets: this.settingsBtn,
        scale: 0.6,
        alpha: 0.8,
        duration: 200,
        ease: 'Back.easeOut',
      });
    });
    
    this.settingsBtn.on("pointerdown", () => {
      this.scene.launch("SettingsScene");
      this.scene.pause();
    });
  }
  
  onWakeFromSettings() {
    this.updateAllEffects();
    this.lastSettings = JSON.parse(JSON.stringify(window.GameSettings.effects));
  }
  
  updateAllEffects() {
    if (this.musicInstance && this.musicInstance.isPlaying) {
      this.tweens.add({
        targets: this.musicInstance,
        volume: window.GameSettings.effects.audioVolume,
        duration: 500,
        ease: 'Power2'
      });
    }
    
    this.updateBackgroundParallax();
    
    this.updateLogoEffects();
    
    // Cập nhật character effects
    this.characterSprites.forEach(({ sprite, shadow, char }) => {
      this.updateCharacterEffects(sprite, shadow, char);
    });
    
    this.setupCharacterRotation();

    this.updatePlayButtonEffects();
    
    this.createBackgroundParticles();
    
    this.updateButtonGlow();
  }
  
  updateButtonGlow() {
    // Xóa glow cũ nếu có
    if (this.buttonGlow && this.buttonGlow.active) {
      this.buttonGlow.destroy();
      this.buttonGlow = null;
    }
    
    if (window.GameSettings.effects.glowEffects && this.playBtn) {
      const { width, height } = this.sys.game.canvas;
      this.buttonGlow = this.add.graphics();
      this.buttonGlow.fillStyle(0xffd700, 0.3);
      this.buttonGlow.fillCircle(width / 2, height - 100, 80);
      this.buttonGlow.setDepth(5);
      
      this.tweens.add({
        targets: this.buttonGlow,
        alpha: { from: 0.3, to: 0.1 },
        scale: { from: 1, to: 1.5 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  // Cleanup khi scene bị destroy
  destroy() {
    // Dừng tất cả events
    if (this.rotationEvent) {
      this.rotationEvent.destroy();
    }
    
    // Xóa event listeners
    this.events.off('wake', this.onWakeFromSettings);
    
    super.destroy();
  }
}
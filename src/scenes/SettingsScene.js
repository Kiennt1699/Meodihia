import Phaser from "phaser";

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: "SettingsScene" });
    this.settingsData = null;
    this.originalSettings = null; // Backup để reset
    this.settingsElements = [];
    this.currentCategory = 'visual';
    this.categories = ['visual', 'audio', 'performance'];
    this.controls = []; // Lưu trữ controls để cập nhật
  }

  preload() {
    this.createSettingsAssets();
  }

  create() {
    const { width, height } = this.sys.game.canvas;
    
    // Tạo backup của settings hiện tại
    this.settingsData = JSON.parse(JSON.stringify(window.GameSettings.effects));
    this.originalSettings = JSON.parse(JSON.stringify(window.GameSettings.effects));
    
    this.createBackground();
    this.createSettingsPanel();
    this.createCategoryTabs();
    this.createSettingsContent();
    this.createControlButtons();
    this.addKeyboardControls();
    this.playEntranceAnimation();
  }

  createSettingsAssets() {
    const graphics = this.add.graphics();
    
    // Toggle switch textures
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRoundedRect(0, 0, 60, 30, 15);
    graphics.generateTexture('toggle-on', 60, 30);
    graphics.clear();
    
    graphics.fillStyle(0x666666, 1);
    graphics.fillRoundedRect(0, 0, 60, 30, 15);
    graphics.generateTexture('toggle-off', 60, 30);
    graphics.clear();
    
    // Button textures
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.lineStyle(2, 0xffd700, 1);
    graphics.fillRoundedRect(0, 0, 120, 40, 10);
    graphics.strokeRoundedRect(0, 0, 120, 40, 10);
    graphics.generateTexture('button-normal', 120, 40);
    graphics.clear();
    
    graphics.fillStyle(0x2a2a3e, 1);
    graphics.lineStyle(2, 0xffd700, 1);
    graphics.fillRoundedRect(0, 0, 120, 40, 10);
    graphics.strokeRoundedRect(0, 0, 120, 40, 10);
    graphics.generateTexture('button-hover', 120, 40);
    
    graphics.destroy();
  }

  createBackground() {
    const { width, height } = this.sys.game.canvas;
    
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive();
    overlay.setDepth(0);
    
    this.createBackgroundPattern();
    
    overlay.on('pointerdown', (pointer, currentlyOver) => {
      if (currentlyOver.length === 0) {
        this.closeSettings();
      }
    });
  }

  createBackgroundPattern() {
    const { width, height } = this.sys.game.canvas;
    
    for (let i = 0; i < 20; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0xffd700, 0.1);
      particle.fillCircle(0, 0, 2 + Math.random() * 3);
      particle.x = Math.random() * width;
      particle.y = Math.random() * height;
      particle.setDepth(1);
      
      this.tweens.add({
        targets: particle,
        x: particle.x + (Math.random() - 0.5) * 100,
        y: particle.y + (Math.random() - 0.5) * 100,
        alpha: { from: 0.1, to: 0.3 },
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  createSettingsPanel() {
    const { width, height } = this.sys.game.canvas;
    
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.95);
    panel.fillRoundedRect(width / 2 - 300, height / 2 - 250, 600, 500, 20);
    panel.lineStyle(3, 0xffd700, 1);
    panel.strokeRoundedRect(width / 2 - 300, height / 2 - 250, 600, 500, 20);
    panel.setDepth(10);
    
    if (this.settingsData.glowEffects) {
      const glow = this.add.graphics();
      glow.fillStyle(0xffd700, 0.2);
      glow.fillRoundedRect(width / 2 - 305, height / 2 - 255, 610, 510, 25);
      glow.setDepth(9);
      
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.2, to: 0.1 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    
    const title = this.add.text(width / 2, height / 2 - 210, 'GAME SETTINGS', {
      font: '32px Arial',
      fill: '#ffd700',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(20);
    
    if (this.settingsData.glowEffects) {
      this.tweens.add({
        targets: title,
        alpha: { from: 1, to: 0.8 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    
    this.settingsElements.push(panel, title);
  }

  createCategoryTabs() {
    const { width, height } = this.sys.game.canvas;
    const tabWidth = 120;
    const tabHeight = 40;
    const startX = width / 2 - (this.categories.length * tabWidth) / 2;
    const tabY = height / 2 - 160;
    
    this.categoryTabs = [];
    
    this.categories.forEach((category, index) => {
      const tabX = startX + index * tabWidth;
      const isActive = category === this.currentCategory;
      
      const tabBg = this.add.graphics();
      tabBg.fillStyle(isActive ? 0x2a2a3e : 0x1a1a2e, 1);
      tabBg.lineStyle(2, isActive ? 0xffd700 : 0x666666, 1);
      tabBg.fillRoundedRect(tabX, tabY, tabWidth, tabHeight, 10);
      tabBg.strokeRoundedRect(tabX, tabY, tabWidth, tabHeight, 10);
      tabBg.setDepth(15);
      tabBg.setInteractive(new Phaser.Geom.Rectangle(tabX, tabY, tabWidth, tabHeight), Phaser.Geom.Rectangle.Contains);
      
      const tabText = this.add.text(tabX + tabWidth / 2, tabY + tabHeight / 2, category.toUpperCase(), {
        font: '14px Arial',
        fill: isActive ? '#ffd700' : '#cccccc',
        fontWeight: 'bold'
      }).setOrigin(0.5).setDepth(20);
      
      // Improved tab interactions
      tabBg.on('pointerover', () => {
        if (category !== this.currentCategory) {
          this.tweens.add({
            targets: tabBg,
            alpha: 0.8,
            duration: 150,
            ease: 'Power2'
          });
          this.tweens.add({
            targets: tabText,
            scale: 1.05,
            duration: 150,
            ease: 'Power2'
          });
          tabText.setFill('#ffffff');
        }
      });
      
      tabBg.on('pointerout', () => {
        if (category !== this.currentCategory) {
          this.tweens.add({
            targets: tabBg,
            alpha: 1,
            duration: 150,
            ease: 'Power2'
          });
          this.tweens.add({
            targets: tabText,
            scale: 1,
            duration: 150,
            ease: 'Power2'
          });
          tabText.setFill('#cccccc');
        }
      });
      
      tabBg.on('pointerdown', () => {
        if (category !== this.currentCategory) {
          this.switchCategory(category);
        }
      });
      
      this.categoryTabs.push({ bg: tabBg, text: tabText, category, x: tabX, y: tabY, width: tabWidth, height: tabHeight });
      this.settingsElements.push(tabBg, tabText);
    });
  }

  createSettingsContent() {
    const { width, height } = this.sys.game.canvas;
    
    this.settingsConfig = {
      visual: [
        { key: 'characterRotation', label: 'Character Rotation', type: 'boolean', description: 'Rotate characters continuously' },
        { key: 'characterFloat', label: 'Character Float', type: 'boolean', description: 'Characters float up and down' },
        { key: 'backgroundParallax', label: 'Background Parallax', type: 'boolean', description: 'Animated background movement' },
        { key: 'glowEffects', label: 'Glow Effects', type: 'boolean', description: 'Enhanced visual glow effects' },
        { key: 'transitionStyle', label: 'Transition Style', type: 'select', options: ['zoom', 'fade', 'slide', 'spiral'], description: 'Scene transition animation' }
      ],
      audio: [
        { key: 'audioVolume', label: 'Music Volume', type: 'slider', min: 0, max: 1, step: 0.1, description: 'Background music volume' }
      ],
      performance: [
        { key: 'particleIntensity', label: 'Particle Effects', type: 'select', options: ['low', 'medium', 'high', 'extreme'], description: 'Particle system intensity' },
        { key: 'screenShake', label: 'Screen Shake', type: 'boolean', description: 'Screen shake on interactions' }
      ]
    };
    
    this.contentContainer = this.add.container(0, 0);
    this.contentContainer.setDepth(20);
    this.settingsElements.push(this.contentContainer);
    
    this.updateSettingsContent();
  }

  updateSettingsContent() {
    const { width, height } = this.sys.game.canvas;
    
    // Clear existing content
    this.contentContainer.removeAll(true);
    this.controls = []; // Reset controls array
    
    const settings = this.settingsConfig[this.currentCategory];
    const startY = height / 2 - 80;
    const spacing = 55;
    
    settings.forEach((setting, index) => {
      const y = startY + index * spacing;
      
      const label = this.add.text(width / 2 - 220, y, setting.label, {
        font: '18px Arial',
        fill: '#ffffff',
        fontWeight: 'bold'
      }).setDepth(25);
      
      const description = this.add.text(width / 2 - 220, y + 20, setting.description, {
        font: '12px Arial',
        fill: '#aaaaaa'
      }).setDepth(25);
      
      let control;
      switch (setting.type) {
        case 'boolean':
          control = this.createToggleControl(width / 2 + 80, y, setting.key);
          break;
        case 'select':
          control = this.createSelectControl(width / 2 + 80, y, setting.key, setting.options);
          break;
        case 'slider':
          control = this.createSliderControl(width / 2 + 80, y, setting.key, setting.min, setting.max, setting.step);
          break;
      }
      
      this.contentContainer.add([label, description, ...control.elements]);
      this.controls.push({ setting, control });
    });
  }

  createToggleControl(x, y, key) {
    const isOn = this.settingsData[key];
    
    const toggleBg = this.add.graphics();
    toggleBg.fillStyle(isOn ? 0x00ff00 : 0x666666, 1);
    toggleBg.fillRoundedRect(x, y - 12, 60, 24, 12);
    toggleBg.setInteractive(new Phaser.Geom.Rectangle(x, y - 12, 60, 24), Phaser.Geom.Rectangle.Contains);
    
    const toggleKnob = this.add.graphics();
    toggleKnob.fillStyle(0xffffff, 1);
    toggleKnob.fillCircle(isOn ? x + 45 : x + 15, y, 10);
    
    const control = {
      elements: [toggleBg, toggleKnob],
      update: (newValue) => {
        const newIsOn = newValue;
        this.tweens.add({
          targets: toggleKnob,
          x: newIsOn ? x + 45 : x + 15,
          duration: 200,
          ease: 'Back.easeOut'
        });
        
        toggleBg.clear();
        toggleBg.fillStyle(newIsOn ? 0x00ff00 : 0x666666, 1);
        toggleBg.fillRoundedRect(x, y - 12, 60, 24, 12);
      }
    };
    
    toggleBg.on('pointerdown', () => {
      this.settingsData[key] = !this.settingsData[key];
      control.update(this.settingsData[key]);
      this.playUISound();
      this.applySettingsRealtime(); // Apply changes immediately
    });
    
    return control;
  }

  createSelectControl(x, y, key, options) {
    const currentValue = this.settingsData[key];
    const currentIndex = options.indexOf(currentValue);
    
    const selectBg = this.add.graphics();
    selectBg.fillStyle(0x333333, 1);
    selectBg.lineStyle(2, 0x666666, 1);
    selectBg.fillRoundedRect(x, y - 15, 140, 30, 8);
    selectBg.strokeRoundedRect(x, y - 15, 140, 30, 8);
    selectBg.setInteractive(new Phaser.Geom.Rectangle(x, y - 15, 140, 30), Phaser.Geom.Rectangle.Contains);
    
    const selectText = this.add.text(x + 70, y, currentValue.toUpperCase(), {
      font: '16px Arial',
      fill: '#ffffff',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    
    const leftArrow = this.add.text(x + 10, y, '<', {
      font: '16px Arial',
      fill: '#ffd700',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    
    const rightArrow = this.add.text(x + 130, y, '>', {
      font: '16px Arial',
      fill: '#ffd700',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    
    const control = {
      elements: [selectBg, selectText, leftArrow, rightArrow],
      update: (newValue) => {
        selectText.setText(newValue.toUpperCase());
        this.tweens.add({
          targets: selectText,
          scale: 1.1,
          duration: 100,
          yoyo: true,
          ease: 'Power2'
        });
      }
    };
    
    selectBg.on('pointerdown', () => {
      const currentIdx = options.indexOf(this.settingsData[key]);
      const nextIndex = (currentIdx + 1) % options.length;
      const nextValue = options[nextIndex];
      this.settingsData[key] = nextValue;
      control.update(nextValue);
      this.playUISound();
      this.applySettingsRealtime();
    });
    
    return control;
  }

  createSliderControl(x, y, key, min, max, step) {
    const currentValue = this.settingsData[key];
    const percentage = (currentValue - min) / (max - min);
    
    const track = this.add.graphics();
    track.fillStyle(0x666666, 1);
    track.fillRoundedRect(x, y - 3, 120, 6, 3);
    
    const fill = this.add.graphics();
    fill.fillStyle(0x00ff00, 1);
    fill.fillRoundedRect(x, y - 3, 120 * percentage, 6, 3);
    
    const handle = this.add.graphics();
    handle.fillStyle(0xffffff, 1);
    handle.fillCircle(x + 120 * percentage, y, 12);
    handle.setInteractive(new Phaser.Geom.Circle(x + 120 * percentage, y, 12), Phaser.Geom.Circle.Contains);
    
    const valueText = this.add.text(x + 140, y, `${Math.round(currentValue * 100)}%`, {
      font: '14px Arial',
      fill: '#ffffff'
    }).setOrigin(0, 0.5);
    
    const control = {
      elements: [track, fill, handle, valueText],
      update: (newValue) => {
        const newPercentage = (newValue - min) / (max - min);
        fill.clear();
        fill.fillStyle(0x00ff00, 1);
        fill.fillRoundedRect(x, y - 3, 120 * newPercentage, 6, 3);
        
        this.tweens.add({
          targets: handle,
          x: x + 120 * newPercentage,
          duration: 200,
          ease: 'Power2'
        });
        
        valueText.setText(`${Math.round(newValue * 100)}%`);
      }
    };
    
    let isDragging = false;
    
    handle.on('pointerdown', () => {
      isDragging = true;
      handle.setTint(0xffd700);
    });
    
    this.input.on('pointermove', (pointer) => {
      if (isDragging && pointer.isDown) {
        const newX = Phaser.Math.Clamp(pointer.x, x, x + 120);
        const newPercentage = (newX - x) / 120;
        const newValue = min + (max - min) * newPercentage;
        const steppedValue = Math.round(newValue / step) * step;
        
        this.settingsData[key] = steppedValue;
        control.update(steppedValue);
        this.applySettingsRealtime();
      }
    });
    
    this.input.on('pointerup', () => {
      if (isDragging) {
        isDragging = false;
        handle.clearTint();
        this.playUISound();
      }
    });
    
    return control;
  }

  switchCategory(newCategory) {
    this.currentCategory = newCategory;
    
    // Update tab appearances with smooth transition
    this.categoryTabs.forEach(tab => {
      const isActive = tab.category === newCategory;
      
      // Clear and redraw tab
      tab.bg.clear();
      tab.bg.fillStyle(isActive ? 0x2a2a3e : 0x1a1a2e, 1);
      tab.bg.lineStyle(2, isActive ? 0xffd700 : 0x666666, 1);
      tab.bg.fillRoundedRect(tab.x, tab.y, tab.width, tab.height, 10);
      tab.bg.strokeRoundedRect(tab.x, tab.y, tab.width, tab.height, 10);
      
      // Animate text color change
      this.tweens.add({
        targets: tab.text,
        tint: isActive ? 0xffd700 : 0xcccccc,
        duration: 200,
        ease: 'Power2'
      });
    });
    
    // Content transition with fade
    this.tweens.add({
      targets: this.contentContainer,
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        this.updateSettingsContent();
        this.tweens.add({
          targets: this.contentContainer,
          alpha: 1,
          duration: 150,
          ease: 'Power2'
        });
      }
    });
    
    this.playUISound();
  }

  // Apply settings in real-time
  applySettingsRealtime() {
    // Update global settings
    Object.assign(window.GameSettings.effects, this.settingsData);
    
    // Trigger update in StartScene if it exists
    const startScene = this.scene.get('StartScene');
    if (startScene && startScene.scene.isActive()) {
      startScene.updateAllEffects();
    }
  }

  createControlButtons() {
    const { width, height } = this.sys.game.canvas;
    
    const resetBtn = this.add.text(width / 2 - 100, height / 2 + 180, 'RESET', {
      font: '20px Arial',
      fill: '#ff6666',
      fontWeight: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(20);
    
    const applyBtn = this.add.text(width / 2, height / 2 + 180, 'APPLY', {
      font: '20px Arial',
      fill: '#66ff66',
      fontWeight: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(20);
    
    const closeBtn = this.add.text(width / 2 + 100, height / 2 + 180, 'CLOSE', {
      font: '20px Arial',
      fill: '#ffd700',
      fontWeight: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(20);
    
    this.setupButtonInteractions(resetBtn, () => this.resetSettings());
    this.setupButtonInteractions(applyBtn, () => this.applySettings());
    this.setupButtonInteractions(closeBtn, () => this.closeSettings());
    
    this.settingsElements.push(resetBtn, applyBtn, closeBtn);
  }

  setupButtonInteractions(button, callback) {
    button.on('pointerover', () => {
      this.tweens.add({
        targets: button,
        scale: 1.1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    button.on('pointerout', () => {
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    button.on('pointerdown', () => {
      this.tweens.add({
        targets: button,
        scale: 0.95,
        duration: 50,
        ease: 'Power2',
        onComplete: () => {
          this.tweens.add({
            targets: button,
            scale: 1.1,
            duration: 100,
            ease: 'Back.easeOut'
          });
          callback();
        }
      });
    });
  }

  addKeyboardControls() {
    this.input.keyboard.on('keydown-ESC', () => {
      this.closeSettings();
    });
    
    this.input.keyboard.on('keydown-TAB', () => {
      const currentIndex = this.categories.indexOf(this.currentCategory);
      const nextIndex = (currentIndex + 1) % this.categories.length;
      this.switchCategory(this.categories[nextIndex]);
    });
  }

  playEntranceAnimation() {
    this.settingsElements.forEach(element => {
      element.setAlpha(0);
      element.setScale(0.8);
    });
    
    this.tweens.add({
      targets: this.settingsElements,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
      stagger: 50
    });
  }

  playUISound() {
    if (this.sound.get('ui-click')) {
      this.sound.play('ui-click', { volume: 0.3 });
    }
  }

  resetSettings() {
    const defaults = {
      characterRotation: false,
      particleIntensity: 'medium',
      backgroundParallax: true,
      characterFloat: true,
      screenShake: true,
      glowEffects: true,
      transitionStyle: 'zoom',
      audioVolume: 0.4
    };
    
    // Update both local and global settings
    this.settingsData = JSON.parse(JSON.stringify(defaults));
    Object.assign(window.GameSettings.effects, defaults);
    
    // Refresh UI
    this.updateSettingsContent();
    
    // Apply to StartScene immediately
    this.applySettingsRealtime();
    
    this.playUISound();
    
    // Visual feedback
    this.tweens.add({
      targets: this.contentContainer,
      scale: 1.05,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  applySettings() {
    // Settings are already applied in real-time, just provide feedback
    this.playUISound();
    
    // Visual feedback
    const { width, height } = this.sys.game.canvas;
    const feedback = this.add.text(width / 2, height / 2 + 220, 'SETTINGS APPLIED!', {
      font: '16px Arial',
      fill: '#66ff66',
      fontWeight: 'bold'
    }).setOrigin(0.5).setDepth(30);
    
    this.tweens.add({
      targets: feedback,
      alpha: 0,
      y: height / 2 + 200,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => feedback.destroy()
    });
    
    this.time.delayedCall(500, () => {
      this.closeSettings();
    });
  }

  closeSettings() {
    this.tweens.add({
      targets: this.settingsElements,
      alpha: 0,
      scale: 0.8,
      duration: 200,
      ease: 'Power2',
      stagger: 30,
      onComplete: () => {
        this.scene.resume("StartScene");
        this.scene.stop();
      }
    });
  }
}
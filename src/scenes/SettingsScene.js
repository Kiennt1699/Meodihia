import Phaser from "phaser";

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: "SettingsScene" });
    this.settingsData = null;
    this.settingsElements = [];
    this.currentCategory = 'visual';
    this.categories = ['visual', 'audio', 'performance'];
  }

  preload() {
    // Create any needed graphics or load assets for the settings UI
    this.createSettingsAssets();
  }

  create() {
    const { width, height } = this.sys.game.canvas;
    
    // Store reference to game settings
    this.settingsData = window.GameSettings.effects;
    
    // Create background overlay
    this.createBackground();
    
    // Create main settings panel
    this.createSettingsPanel();
    
    // Create category tabs
    this.createCategoryTabs();
    
    // Create settings content
    this.createSettingsContent();
    
    // Create control buttons
    this.createControlButtons();
    
    // Add keyboard controls
    this.addKeyboardControls();
    
    // Entrance animation
    this.playEntranceAnimation();
  }

  createSettingsAssets() {
    // Create dynamic graphics for UI elements
    const graphics = this.add.graphics();
    
    // Create toggle switch texture
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRoundedRect(0, 0, 60, 30, 15);
    graphics.generateTexture('toggle-on', 60, 30);
    graphics.clear();
    
    graphics.fillStyle(0x666666, 1);
    graphics.fillRoundedRect(0, 0, 60, 30, 15);
    graphics.generateTexture('toggle-off', 60, 30);
    graphics.clear();
    
    // Create button textures
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
    
    // Animated background overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive();
    overlay.setDepth(0);
    
    // Add subtle animated background pattern
    this.createBackgroundPattern();
    
    // Close on background click
    overlay.on('pointerdown', (pointer, currentlyOver) => {
      if (currentlyOver.length === 0) {
        this.closeSettings();
      }
    });
  }

  createBackgroundPattern() {
    const { width, height } = this.sys.game.canvas;
    
    // Create subtle moving particles
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
    
    // Main panel background
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.95);
    panel.fillRoundedRect(width / 2 - 300, height / 2 - 250, 600, 500, 20);
    panel.lineStyle(3, 0xffd700, 1);
    panel.strokeRoundedRect(width / 2 - 300, height / 2 - 250, 600, 500, 20);
    panel.setDepth(10);
    
    // Panel glow effect
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
    
    // Title
    const title = this.add.text(width / 2, height / 2 - 210, 'GAME SETTINGS', {
      font: '32px Arial',
      fill: '#ffd700',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(20);
    
    // Add title glow effect
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
      
      // Tab background
      const tabBg = this.add.graphics();
      tabBg.fillStyle(isActive ? 0x2a2a3e : 0x1a1a2e, 1);
      tabBg.lineStyle(2, isActive ? 0xffd700 : 0x666666, 1);
      tabBg.fillRoundedRect(tabX, tabY, tabWidth, tabHeight, 10);
      tabBg.strokeRoundedRect(tabX, tabY, tabWidth, tabHeight, 10);
      tabBg.setDepth(15);
      tabBg.setInteractive(new Phaser.Geom.Rectangle(tabX, tabY, tabWidth, tabHeight), Phaser.Geom.Rectangle.Contains);
      
      // Tab text
      const tabText = this.add.text(tabX + tabWidth / 2, tabY + tabHeight / 2, category.toUpperCase(), {
        font: '14px Arial',
        fill: isActive ? '#ffd700' : '#cccccc',
        fontWeight: 'bold'
      }).setOrigin(0.5).setDepth(20);
      
      // Tab interaction
      tabBg.on('pointerover', () => {
        if (category !== this.currentCategory) {
          tabBg.clear();
          tabBg.fillStyle(0x2a2a3e, 0.8);
          tabBg.lineStyle(2, 0xffd700, 0.8);
          tabBg.fillRoundedRect(tabX, tabY, tabWidth, tabHeight, 10);
          tabBg.strokeRoundedRect(tabX, tabY, tabWidth, tabHeight, 10);
          tabText.setFill('#ffffff');
        }
      });
      
      tabBg.on('pointerout', () => {
        if (category !== this.currentCategory) {
          tabBg.clear();
          tabBg.fillStyle(0x1a1a2e, 1);
          tabBg.lineStyle(2, 0x666666, 1);
          tabBg.fillRoundedRect(tabX, tabY, tabWidth, tabHeight, 10);
          tabBg.strokeRoundedRect(tabX, tabY, tabWidth, tabHeight, 10);
          tabText.setFill('#cccccc');
        }
      });
      
      tabBg.on('pointerdown', () => {
        if (category !== this.currentCategory) {
          this.switchCategory(category);
        }
      });
      
      this.categoryTabs.push({ bg: tabBg, text: tabText, category });
      this.settingsElements.push(tabBg, tabText);
    });
  }

  createSettingsContent() {
    const { width, height } = this.sys.game.canvas;
    
    // Content area
    const contentY = height / 2 - 100;
    const contentHeight = 200;
    
    // Settings definitions organized by category
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
    
    const settings = this.settingsConfig[this.currentCategory];
    const startY = height / 2 - 80;
    const spacing = 45;
    
    settings.forEach((setting, index) => {
      const y = startY + index * spacing;
      
      // Setting label
      const label = this.add.text(width / 2 - 220, y, setting.label, {
        font: '18px Arial',
        fill: '#ffffff',
        fontWeight: 'bold'
      }).setDepth(25);
      
      // Setting description
      const description = this.add.text(width / 2 - 220, y + 18, setting.description, {
        font: '12px Arial',
        fill: '#aaaaaa'
      }).setDepth(25);
      
      // Setting control
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
      
      this.contentContainer.add([label, description, ...control]);
    });
  }

  createToggleControl(x, y, key) {
    const isOn = this.settingsData[key];
    
    // Toggle background
    const toggleBg = this.add.graphics();
    toggleBg.fillStyle(isOn ? 0x00ff00 : 0x666666, 1);
    toggleBg.fillRoundedRect(x, y - 12, 60, 24, 12);
    toggleBg.setInteractive(new Phaser.Geom.Rectangle(x, y - 12, 60, 24), Phaser.Geom.Rectangle.Contains);
    
    // Toggle knob
    const toggleKnob = this.add.graphics();
    toggleKnob.fillStyle(0xffffff, 1);
    toggleKnob.fillCircle(isOn ? x + 45 : x + 15, y, 10);
    
    // Toggle interaction
    toggleBg.on('pointerdown', () => {
      this.settingsData[key] = !this.settingsData[key];
      const newIsOn = this.settingsData[key];
      
      // Animate toggle
      this.tweens.add({
        targets: toggleKnob,
        x: newIsOn ? x + 45 : x + 15,
        duration: 200,
        ease: 'Back.easeOut'
      });
      
      // Update colors
      toggleBg.clear();
      toggleBg.fillStyle(newIsOn ? 0x00ff00 : 0x666666, 1);
      toggleBg.fillRoundedRect(x, y - 12, 60, 24, 12);
      
      // Play sound feedback
      this.playUISound();
    });
    
    return [toggleBg, toggleKnob];
  }

  createSelectControl(x, y, key, options) {
    const currentValue = this.settingsData[key];
    const currentIndex = options.indexOf(currentValue);
    
    // Select background
    const selectBg = this.add.graphics();
    selectBg.fillStyle(0x333333, 1);
    selectBg.lineStyle(2, 0x666666, 1);
    selectBg.fillRoundedRect(x, y - 15, 140, 30, 8);
    selectBg.strokeRoundedRect(x, y - 15, 140, 30, 8);
    selectBg.setInteractive(new Phaser.Geom.Rectangle(x, y - 15, 140, 30), Phaser.Geom.Rectangle.Contains);
    
    // Select text
    const selectText = this.add.text(x + 70, y, currentValue.toUpperCase(), {
      font: '16px Arial',
      fill: '#ffffff',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    
    // Arrow indicators
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
    
    // Interaction
    selectBg.on('pointerdown', () => {
      const nextIndex = (currentIndex + 1) % options.length;
      const nextValue = options[nextIndex];
      this.settingsData[key] = nextValue;
      selectText.setText(nextValue.toUpperCase());
      
      // Flash effect
      this.tweens.add({
        targets: selectBg,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
      
      this.playUISound();
    });
    
    return [selectBg, selectText, leftArrow, rightArrow];
  }

  createSliderControl(x, y, key, min, max, step) {
    const currentValue = this.settingsData[key];
    const percentage = (currentValue - min) / (max - min);
    
    // Slider track
    const track = this.add.graphics();
    track.fillStyle(0x666666, 1);
    track.fillRoundedRect(x, y - 3, 120, 6, 3);
    
    // Slider fill
    const fill = this.add.graphics();
    fill.fillStyle(0x00ff00, 1);
    fill.fillRoundedRect(x, y - 3, 120 * percentage, 6, 3);
    
    // Slider handle
    const handle = this.add.graphics();
    handle.fillStyle(0xffffff, 1);
    handle.fillCircle(x + 120 * percentage, y, 12);
    handle.setInteractive(new Phaser.Geom.Circle(x + 120 * percentage, y, 12), Phaser.Geom.Circle.Contains);
    
    // Value display
    const valueText = this.add.text(x + 140, y, `${Math.round(currentValue * 100)}%`, {
      font: '14px Arial',
      fill: '#ffffff'
    }).setOrigin(0, 0.5);
    
    // Drag functionality
    handle.on('pointerdown', () => {
      handle.setTint(0xffd700);
    });
    
    this.input.on('pointermove', (pointer) => {
      if (handle.input.enabled && pointer.isDown) {
        const newX = Phaser.Math.Clamp(pointer.x, x, x + 120);
        const newPercentage = (newX - x) / 120;
        const newValue = min + (max - min) * newPercentage;
        const steppedValue = Math.round(newValue / step) * step;
        
        this.settingsData[key] = steppedValue;
        
        // Update visuals
        fill.clear();
        fill.fillStyle(0x00ff00, 1);
        fill.fillRoundedRect(x, y - 3, 120 * newPercentage, 6, 3);
        
        handle.x = newX;
        valueText.setText(`${Math.round(steppedValue * 100)}%`);
      }
    });
    
    this.input.on('pointerup', () => {
      handle.clearTint();
    });
    
    return [track, fill, handle, valueText];
  }

  switchCategory(newCategory) {
    this.currentCategory = newCategory;
    
    // Update tab appearances
    this.categoryTabs.forEach(tab => {
      const isActive = tab.category === newCategory;
      const tabBounds = tab.bg.getBounds();
      
      tab.bg.clear();
      tab.bg.fillStyle(isActive ? 0x2a2a3e : 0x1a1a2e, 1);
      tab.bg.lineStyle(2, isActive ? 0xffd700 : 0x666666, 1);
      tab.bg.fillRoundedRect(tabBounds.x, tabBounds.y, tabBounds.width, tabBounds.height, 10);
      tab.bg.strokeRoundedRect(tabBounds.x, tabBounds.y, tabBounds.width, tabBounds.height, 10);
      
      tab.text.setFill(isActive ? '#ffd700' : '#cccccc');
    });
    
    // Update content with slide animation
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

  createControlButtons() {
    const { width, height } = this.sys.game.canvas;
    
    // Reset to defaults button
    const resetBtn = this.add.text(width / 2 - 100, height / 2 + 180, 'RESET', {
      font: '20px Arial',
      fill: '#ff6666',
      fontWeight: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(20);
    
    // Apply button
    const applyBtn = this.add.text(width / 2, height / 2 + 180, 'APPLY', {
      font: '20px Arial',
      fill: '#66ff66',
      fontWeight: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(20);
    
    // Close button
    const closeBtn = this.add.text(width / 2 + 100, height / 2 + 180, 'CLOSE', {
      font: '20px Arial',
      fill: '#ffd700',
      fontWeight: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(20);
    
    // Button interactions
    this.setupButtonInteractions(resetBtn, () => this.resetSettings());
    this.setupButtonInteractions(applyBtn, () => this.applySettings());
    this.setupButtonInteractions(closeBtn, () => this.closeSettings());
    
    this.settingsElements.push(resetBtn, applyBtn, closeBtn);
  }

  setupButtonInteractions(button, callback) {
    button.on('pointerover', () => {
      button.setScale(1.1);
      this.tweens.add({
        targets: button,
        alpha: 0.8,
        duration: 100
      });
    });
    
    button.on('pointerout', () => {
      button.setScale(1);
      this.tweens.add({
        targets: button,
        alpha: 1,
        duration: 100
      });
    });
    
    button.on('pointerdown', () => {
      button.setScale(0.95);
      this.time.delayedCall(100, () => {
        button.setScale(1.1);
        callback();
      });
    });
  }

  addKeyboardControls() {
    // ESC to close
    this.input.keyboard.on('keydown-ESC', () => {
      this.closeSettings();
    });
    
    // Tab to switch categories
    this.input.keyboard.on('keydown-TAB', () => {
      const currentIndex = this.categories.indexOf(this.currentCategory);
      const nextIndex = (currentIndex + 1) % this.categories.length;
      this.switchCategory(this.categories[nextIndex]);
    });
  }

  playEntranceAnimation() {
    // Set initial states
    this.settingsElements.forEach(element => {
      element.setAlpha(0);
      element.setScale(0.8);
    });
    
    // Animate entrance
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
    // Play a subtle UI sound if available
    if (this.sound.get('ui-click')) {
      this.sound.play('ui-click', { volume: 0.2 });
    }
  }

  resetSettings() {
    // Reset to default values
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
    
    Object.assign(this.settingsData, defaults);
    this.updateSettingsContent();
    this.playUISound();
  }

  applySettings() {
    // Settings are already applied in real-time
    // This could save to localStorage if needed
    this.closeSettings();
  }

  closeSettings() {
    // Exit animation
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
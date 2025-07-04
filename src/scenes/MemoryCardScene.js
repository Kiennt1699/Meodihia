import Phaser from "phaser";

const CARD_PAIRS = [
  { key: "puss_2", img: "card_char1_puss.png", circle: "Characters/circle_char1_puss.png", reveal: "Characters/circle_char1_puss_reveal.png" },
  { key: "kitty_2", img: "card_char2_kitty.png", circle: "Characters/circle_char2_kitty.png", reveal: "Characters/circle_char2_kitty_reveal.png" },
  { key: "perro_2", img: "card_char3_perro.png", circle: "Characters/circle_char3_perro.png", reveal: "Characters/circle_char3_perro_reveal.png" },
  { key: "goldilocks_2", img: "card_char4_goldilocks.png", circle: "Characters/circle_char4_goldilocks.png", reveal: "Characters/circle_char4_goldilocks_reveal.png" },
  { key: "bear_2", img: "card_char5_bear.png", circle: "Characters/circle_char5_bear.png", reveal: "Characters/circle_char5_bear_reveal.png" },
  { key: "wolf_2", img: "card_char6_wolf.png", circle: "Characters/circle_char6_wolf.png", reveal: "Characters/circle_char6_wolf_reveal.png" },
];

export default class MemoryCardScene extends Phaser.Scene {
  constructor() {
    super({ key: "MemoryCardScene" });
    this.cards = [];
    this.firstCard = null;
    this.secondCard = null;
    this.locked = false;
    this.matched = {};
    this.timer = 30;
    this.timerEvent = null;
    this.circles = [];
    this.particles = [];
    this.stars = [];
    this.comboCount = 0;
    this.shakeCamera = false;
  }

  preload() {
    this.load.image("bg2", "public/assets/bg_2.jpg");
    this.load.image("tutorial", "public/assets/game2_tutorial.png");
    this.load.image("btn_start", "public/assets/btn_start.png");
    this.load.image("cardback", "public/assets/cardback.png");
    this.load.image("timeplate", "public/assets/timeplate.png");

    CARD_PAIRS.forEach(pair => {
      this.load.image(pair.key, `public/assets/${pair.img}`);
      this.load.image(`${pair.key}_circle`, `public/assets/${pair.circle}`);
      this.load.image(`${pair.key}_reveal`, `public/assets/${pair.reveal}`);
    });
  }

  create() {
    // Background with parallax effect
    this.bg = this.add.image(400, 600, "bg2").setDisplaySize(800, 1200);
    this.createFloatingStars();

    // Tutorial overlay with entrance animation
    this.tutorial = this.add.image(400, 600, "tutorial").setDepth(10).setAlpha(0);
    this.startBtn = this.add.image(400, 950, "btn_start").setInteractive().setDepth(11).setAlpha(0);
    
    // Animate tutorial entrance
    this.tweens.add({
      targets: [this.tutorial, this.startBtn],
      alpha: 1,
      duration: 800,
      ease: 'Back.easeOut'
    });

    // Enhanced start button with hover effects
    this.startBtn.on("pointerover", () => {
      this.tweens.add({
        targets: this.startBtn,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: 'Power2'
      });
    });

    this.startBtn.on("pointerout", () => {
      this.tweens.add({
        targets: this.startBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Power2'
      });
    });

    this.startBtn.on("pointerdown", () => {
      this.cameras.main.shake(100, 0.01);
      this.startGame();
    });

    // Enhanced timer with glow effect
    this.timeplate = this.add.image(400, 100, "timeplate").setScale(1.2).setVisible(false);
    this.timerText = this.add.text(400, 100, "30", {
      font: "48px Arial",
      color: "#fff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(2).setVisible(false);

    // Timer warning glow
    this.timerGlow = this.add.circle(400, 100, 80, 0xff0000, 0).setVisible(false);

    // Circles with enhanced animations
    this.circles = [];
    for (let i = 0; i < 6; i++) {
      const x = 180 + i * 90;
      const y = 1100;
      const pair = CARD_PAIRS[i];
      const circle = this.add.image(x, y, `${pair.key}_circle`).setScale(0.8).setVisible(true);
      const reveal = this.add.image(x, y, `${pair.key}_reveal`).setScale(0.8).setVisible(false);
      
      // Add subtle breathing animation to circles
      this.tweens.add({
        targets: circle,
        scaleX: 0.85,
        scaleY: 0.85,
        duration: 2000 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.circles.push({ circle, reveal });
    }

    // Cards group
    this.cardsGroup = this.add.group();

    // Enhanced time up overlay with particles
    this.timeUpOverlay = this.add.rectangle(400, 600, 800, 1200, 0x000000, 0.7).setDepth(20).setVisible(false);
    this.timeUpText = this.add.text(400, 600, "Time Up!", {
      font: "64px Arial",
      color: "#fff",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(21).setVisible(false);

    // Combo text
    this.comboText = this.add.text(400, 200, "", {
      font: "32px Arial",
      color: "#ffff00",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(15).setVisible(false);

    // Success particles system
    this.createParticleSystem();
  }

  createFloatingStars() {
    for (let i = 0; i < 20; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(0, 1200),
        Phaser.Math.Between(1, 3),
        0xffffff,
        0.3
      ).setDepth(1);

      this.tweens.add({
        targets: star,
        alpha: 0.8,
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.stars.push(star);
    }
  }

  createParticleSystem() {
    // Create particle graphics
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xffd700);
    particleGraphics.fillCircle(0, 0, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    // Heart particle
    const heartGraphics = this.add.graphics();
    heartGraphics.fillStyle(0xff69b4);
    heartGraphics.fillCircle(0, 0, 3);
    heartGraphics.generateTexture('heart', 6, 6);
    heartGraphics.destroy();
  }

  startGame() {
    // Enhanced start transition
    this.tweens.add({
      targets: [this.tutorial, this.startBtn],
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 400,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.tutorial.setVisible(false);
        this.startBtn.setVisible(false);
      }
    });

    // Animate UI elements entrance
    this.timeplate.setVisible(true).setAlpha(0).setScale(0.5);
    this.timerText.setVisible(true).setAlpha(0);
    this.timerGlow.setVisible(true);

    this.tweens.add({
      targets: [this.timeplate, this.timerText],
      alpha: 1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 600,
      ease: 'Back.easeOut',
      delay: 200
    });

    this.matched = {};
    this.cards = [];
    this.firstCard = null;
    this.secondCard = null;
    this.locked = false;
    this.comboCount = 0;

    // Reset circles with animation
    this.circles.forEach(({ circle, reveal }, index) => {
      circle.setVisible(true).setAlpha(0);
      reveal.setVisible(false);
      
      this.tweens.add({
        targets: circle,
        alpha: 1,
        duration: 300,
        delay: index * 100,
        ease: 'Power2.easeOut'
      });
    });

    // Create shuffled cards
    let cardData = [];
    CARD_PAIRS.forEach(pair => {
      cardData.push({ key: pair.key, img: pair.key });
      cardData.push({ key: pair.key, img: pair.key });
    });
    Phaser.Utils.Array.Shuffle(cardData);

    // Place cards with staggered animation
    let idx = 0;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const x = 200 + col * 130;
        const y = 320 + row * 180;
        const data = cardData[idx];
        const card = this.createCard(x, y, data.key, data.img);
        this.cards.push(card);
        this.cardsGroup.add(card.container);
        
        // Entrance animation
        card.container.setAlpha(0).setScale(0.3);
        this.tweens.add({
          targets: card.container,
          alpha: 1,
          scaleX: 1,
          scaleY: 1,
          duration: 400,
          delay: idx * 80,
          ease: 'Back.easeOut'
        });
        
        idx++;
      }
    }

    // Enhanced timer with warnings
    this.timer = 30;
    this.timerText.setText(this.timer);
    if (this.timerEvent) this.timerEvent.remove();
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: 29,
      callback: () => {
        this.timer--;
        this.timerText.setText(this.timer);
        
        // Timer warning effects
        if (this.timer <= 30000) {
          this.timerText.setColor('#ff0000');
          this.tweens.add({
            targets: this.timerGlow,
            alpha: 0.3,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
          });
          
          if (this.timer <= 5) {
            this.cameras.main.shake(50, 0.005);
          }
        }
        
        if (this.timer === 0) this.timeUp();
      },
    });
  }

  createCard(x, y, key, imgKey) {
    const container = this.add.container(x, y);
    const back = this.add.image(0, 0, "cardback").setScale(0.9);
    const front = this.add.image(0, 0, imgKey).setScale(0.9).setVisible(false);
    
    // Add card glow effect
    const glow = this.add.circle(0, 0, 80, 0xffffff, 0).setScale(0.9);
    container.add([glow, back, front]);
    
    container.setSize(back.width * 0.9, back.height * 0.9);
    container.setInteractive();

    // Enhanced hover effects
    container.on("pointerover", () => {
      if (!this.locked) {
        this.tweens.add({
          targets: container,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 200,
          ease: 'Power2'
        });
        this.tweens.add({
          targets: glow,
          alpha: 0.2,
          duration: 200
        });
      }
    });

    container.on("pointerout", () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Power2'
      });
      this.tweens.add({
        targets: glow,
        alpha: 0,
        duration: 200
      });
    });

    container.on("pointerdown", () => this.onCardClicked(container, key, back, front, glow));

    return { container, key, back, front, glow, matched: false };
  }

  onCardClicked(container, key, back, front, glow) {
    if (this.locked) return;
    const card = this.cards.find(c => c.container === container);
    if (card.matched || card === this.firstCard) return;

    // Enhanced flip animation
    this.tweens.add({
      targets: container,
      scaleX: 0,
      duration: 150,
      ease: 'Power2.easeIn',
      onComplete: () => {
        back.setVisible(false);
        front.setVisible(true);
        this.tweens.add({
          targets: container,
          scaleX: 1,
          duration: 150,
          ease: 'Power2.easeOut'
        });
      }
    });

    // Card flip sound effect (visual feedback)
    this.tweens.add({
      targets: glow,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });

    if (!this.firstCard) {
      this.firstCard = card;
    } else if (!this.secondCard) {
      this.secondCard = card;
      this.locked = true;

      if (this.firstCard.key === this.secondCard.key) {
        // MATCH! Enhanced success effects
        this.firstCard.matched = true;
        this.secondCard.matched = true;
        this.comboCount++;
        
        // Success visual effects
        this.createSuccessParticles(this.firstCard.container.x, this.firstCard.container.y);
        this.createSuccessParticles(this.secondCard.container.x, this.secondCard.container.y);
        
        // Screen flash
        const flash = this.add.rectangle(400, 600, 800, 1200, 0xffffff, 0.3).setDepth(50);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 200,
          onComplete: () => flash.destroy()
        });

        // Combo text
        if (this.comboCount > 1) {
          this.showComboText();
        }

        // Card success glow
        [this.firstCard, this.secondCard].forEach(card => {
          this.tweens.add({
            targets: card.glow,
            alpha: 0.6,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            ease: 'Power2.easeOut'
          });
        });

        this.showRevealCircle(this.firstCard.key);
        
        this.time.delayedCall(600, () => {
          this.resetFlipped();
          if (this.cards.every(c => c.matched)) this.finishGame();
        });
      } else {
        // Wrong match - enhanced error effects
        this.comboCount = 0;
        this.showWrongEffect(this.firstCard, this.secondCard);
        
        // Screen shake
        this.cameras.main.shake(100, 0.01);
        
        this.time.delayedCall(600, () => {
          // Enhanced flip back animation
          [this.firstCard, this.secondCard].forEach(card => {
            this.tweens.add({
              targets: card.container,
              scaleX: 0,
              duration: 150,
              ease: 'Power2.easeIn',
              onComplete: () => {
                card.back.setVisible(true).clearTint();
                card.front.setVisible(false);
                this.tweens.add({
                  targets: card.container,
                  scaleX: 1,
                  duration: 150,
                  ease: 'Power2.easeOut'
                });
              }
            });
          });
          
          this.time.delayedCall(300, () => {
            this.resetFlipped();
          });
        });
      }
    }
  }

  createSuccessParticles(x, y) {
    // Golden particles explosion
    for (let i = 0; i < 15; i++) {
      const particle = this.add.circle(x, y, Phaser.Math.Between(2, 5), 0xffd700, 1).setDepth(30);
      const angle = Phaser.Math.Between(0, 360);
      const speed = Phaser.Math.Between(100, 200);
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 800,
        ease: 'Power2.easeOut',
        onComplete: () => particle.destroy()
      });
    }

    // Heart particles
    for (let i = 0; i < 8; i++) {
      const heart = this.add.circle(x, y, 3, 0xff69b4, 1).setDepth(30);
      const angle = Phaser.Math.Between(0, 360);
      const speed = Phaser.Math.Between(50, 150);
      
      this.tweens.add({
        targets: heart,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed - 50,
        alpha: 0,
        duration: 1000,
        ease: 'Power2.easeOut',
        onComplete: () => heart.destroy()
      });
    }
  }

  showComboText() {
    this.comboText.setText(`COMBO x${this.comboCount}!`).setVisible(true).setAlpha(1).setScale(0.5);
    
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.comboText,
          alpha: 0,
          y: 150,
          duration: 800,
          ease: 'Power2.easeOut',
          onComplete: () => {
            this.comboText.setY(200);
          }
        });
      }
    });
  }

  showRevealCircle(key) {
    const idx = CARD_PAIRS.findIndex(pair => pair.key === key);
    if (idx !== -1) {
      const { circle, reveal } = this.circles[idx];
      
      // Animate circle reveal
      this.tweens.add({
        targets: circle,
        alpha: 0,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 400,
        ease: 'Power2.easeOut',
        onComplete: () => {
          circle.setVisible(false);
          reveal.setVisible(true).setAlpha(0).setScale(0.3);
          
          this.tweens.add({
            targets: reveal,
            alpha: 1,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 400,
            ease: 'Back.easeOut'
          });
        }
      });
    }
  }

  showWrongEffect(card1, card2) {
    // Enhanced error effect with pulsing red
    [card1, card2].forEach(card => {
      this.tweens.add({
        targets: card.glow,
        alpha: 0.8,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 200,
        yoyo: true,
        repeat: 2,
        ease: 'Power2'
      });
      
      // Red tint pulse
      this.tweens.add({
        targets: card.container,
        tint: 0xff0000,
        duration: 200,
        yoyo: true,
        repeat: 2,
        ease: 'Power2'
      });
    });
  }

  resetFlipped() {
    this.firstCard = null;
    this.secondCard = null;
    this.locked = false;
  }

  finishGame() {
    this.timerEvent?.remove();
    
    // Victory celebration
    this.createVictoryEffects();
    
    this.time.delayedCall(1500, () => {
      this.scene.start("EndScene");
    });
  }

  createVictoryEffects() {
    // Screen flash
    const flash = this.add.rectangle(400, 600, 800, 1200, 0xffffff, 0.5).setDepth(50);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });

    // Fireworks particles
    for (let i = 0; i < 50; i++) {
      const firework = this.add.circle(
        Phaser.Math.Between(100, 700),
        Phaser.Math.Between(200, 800),
        Phaser.Math.Between(3, 8),
        Phaser.Math.Between(0xff0000, 0xffffff),
        1
      ).setDepth(40);

      this.tweens.add({
        targets: firework,
        y: firework.y - Phaser.Math.Between(100, 300),
        alpha: 0,
        duration: Phaser.Math.Between(800, 1200),
        ease: 'Power2.easeOut',
        onComplete: () => firework.destroy()
      });
    }

    // Confetti
    for (let i = 0; i < 30; i++) {
      const confetti = this.add.rectangle(
        Phaser.Math.Between(0, 800),
        -50,
        Phaser.Math.Between(5, 15),
        Phaser.Math.Between(5, 15),
        Phaser.Math.Between(0xff0000, 0xffffff),
        1
      ).setDepth(40);

      this.tweens.add({
        targets: confetti,
        y: 1250,
        rotation: Phaser.Math.Between(0, 6),
        duration: Phaser.Math.Between(2000, 3000),
        ease: 'Power2.easeIn',
        onComplete: () => confetti.destroy()
      });
    }
  }

  timeUp() {
    this.locked = true;
    this.timeUpOverlay.setVisible(true).setAlpha(0);
    this.timeUpText.setVisible(true).setAlpha(0).setScale(0.3);
    
    // Dramatic entrance
    this.tweens.add({
      targets: this.timeUpOverlay,
      alpha: 0.8,
      duration: 400,
      ease: 'Power2.easeOut'
    });
    
    this.tweens.add({
      targets: this.timeUpText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      ease: 'Back.easeOut',
      delay: 200
    });
    
    // Text pulse
    this.tweens.add({
      targets: this.timeUpText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 500,
      yoyo: true,
      repeat: 2,
      ease: 'Power2'
    });
    
    this.timerText.setVisible(false);
    this.time.delayedCall(2000, () => {
      this.scene.start("EndScene");
    });
  }
}
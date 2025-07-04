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
    // Background
    this.add.image(400, 600, "bg2").setDisplaySize(800, 1200);

    // Tutorial overlay
    this.tutorial = this.add.image(400, 600, "tutorial").setDepth(10);
    this.startBtn = this.add.image(400, 950, "btn_start").setInteractive().setDepth(11);
    this.startBtn.on("pointerdown", () => this.startGame());

    // Timer
    this.timeplate = this.add.image(400, 100, "timeplate").setScale(1.2).setVisible(false);
    this.timerText = this.add.text(400, 100, "30", {
      font: "48px Arial",
      color: "#fff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(2).setVisible(false);

    // Circles (bottom row)
    this.circles = [];
    for (let i = 0; i < 6; i++) {
      const x = 180 + i * 90;
      const y = 1100;
      const pair = CARD_PAIRS[i];
      const circle = this.add.image(x, y, `${pair.key}_circle`).setScale(0.8).setVisible(true);
      const reveal = this.add.image(x, y, `${pair.key}_reveal`).setScale(0.8).setVisible(false);
      this.circles.push({ circle, reveal });
    }

    // Cards group
    this.cardsGroup = this.add.group();

    // Time up overlay
    this.timeUpOverlay = this.add.rectangle(400, 600, 800, 1200, 0x000000, 0.7).setDepth(20).setVisible(false);
    this.timeUpText = this.add.text(400, 600, "Time Up!", {
      font: "64px Arial",
      color: "#fff",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(21).setVisible(false);
  }

  startGame() {
    this.tutorial.setVisible(false);
    this.startBtn.setVisible(false);
    this.timeplate.setVisible(true);
    this.timerText.setVisible(true);

    this.matched = {};
    this.cards = [];
    this.firstCard = null;
    this.secondCard = null;
    this.locked = false;

    // Reset circles
    this.circles.forEach(({ circle, reveal }) => {
      circle.setVisible(true);
      reveal.setVisible(false);
    });

    // Create shuffled cards
    let cardData = [];
    CARD_PAIRS.forEach(pair => {
      cardData.push({ key: pair.key, img: pair.key });
      cardData.push({ key: pair.key, img: pair.key });
    });
    Phaser.Utils.Array.Shuffle(cardData);

    // Place cards (4x3 grid)
    let idx = 0;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const x = 200 + col * 130;
        const y = 320 + row * 180;
        const data = cardData[idx++];
        const card = this.createCard(x, y, data.key, data.img);
        this.cards.push(card);
        this.cardsGroup.add(card.container);
      }
    }

    // Timer
    this.timer = 30000;
    this.timerText.setText(this.timer);
    if (this.timerEvent) this.timerEvent.remove();
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: 29,
      callback: () => {
        this.timer--;
        this.timerText.setText(this.timer);
        if (this.timer === 0) this.timeUp();
      },
    });
  }

  createCard(x, y, key, imgKey) {
    const container = this.add.container(x, y);
    const back = this.add.image(0, 0, "cardback").setScale(0.9);
    const front = this.add.image(0, 0, imgKey).setScale(0.9).setVisible(false);
    container.add([back, front]);
    container.setSize(back.width * 0.9, back.height * 0.9);
    container.setInteractive();

    container.on("pointerdown", () => this.onCardClicked(container, key, back, front));

    return { container, key, back, front, matched: false };
  }

  onCardClicked(container, key, back, front) {
    if (this.locked) return;
    const card = this.cards.find(c => c.container === container);
    if (card.matched || card === this.firstCard) return;

    // Flip card
    back.setVisible(false);
    front.setVisible(true);

    if (!this.firstCard) {
      this.firstCard = card;
    } else if (!this.secondCard) {
      this.secondCard = card;
      this.locked = true;

      if (this.firstCard.key === this.secondCard.key) {
        // Match!
        this.firstCard.matched = true;
        this.secondCard.matched = true;
        this.showRevealCircle(this.firstCard.key);
        this.time.delayedCall(500, () => {
          this.resetFlipped();
          if (this.cards.every(c => c.matched)) this.finishGame();
        });
      } else {
        // Not match: show red effect, flip back
        this.showWrongEffect(this.firstCard, this.secondCard);
        this.time.delayedCall(800, () => {
          this.firstCard.back.setTint(0xff0000);
          this.secondCard.back.setTint(0xff0000);
          this.time.delayedCall(400, () => {
            this.firstCard.back.setVisible(true).clearTint();
            this.firstCard.front.setVisible(false);
            this.secondCard.back.setVisible(true).clearTint();
            this.secondCard.front.setVisible(false);
            this.resetFlipped();
          });
        });
      }
    }
  }

  showRevealCircle(key) {
    const idx = CARD_PAIRS.findIndex(pair => pair.key === key);
    if (idx !== -1) {
      this.circles[idx].circle.setVisible(false);
      this.circles[idx].reveal.setVisible(true);
    }
  }

  showWrongEffect(card1, card2) {
    card1.back.setTint(0xff0000);
    card2.back.setTint(0xff0000);
  }

  resetFlipped() {
    this.firstCard = null;
    this.secondCard = null;
    this.locked = false;
  }

  finishGame() {
    this.timerEvent?.remove();
    this.time.delayedCall(800, () => {
      this.scene.start("EndScene");
    });
  }

  timeUp() {
    this.locked = true;
    this.timeUpOverlay.setVisible(true);
    this.timeUpText.setVisible(true);
    this.timerText.setVisible(false);
    this.time.delayedCall(1800, () => {
      this.scene.start("EndScene");
    });
  }
}
import Phaser from "phaser";

const QUIZ_DATA = [
  {
    badgeImg: "q1",
    questionImg: "q1",
    questionText: 'Who is\n "Puss In Boots"?',
    options: [
      { img: "q1_option A", correct: true },
      { img: "q1_option B", correct: false },
    ],
    explanation:
      'Puss In Boots is a cat hero of many aliases, including: "Diablo Gato", "The Furry Lover", "Chupacabra", "Frisky Two Times", and "The Ginger Hit Man".',
  },
  {
    badgeImg: "q2",
    questionImg: "q2",
    questionText: 'Puss In Boots has\n_______ lives.',
    options: [
      { img: "q2_option A", correct: false },
      { img: "q2_option B", correct: true },
    ],
    explanation:
      "Puss In Boots is a special cat that has nine lives. Having burned through eight of them, he must set out on a journey to find the mythical Last Wish and restore his lost lives.",
  },
  {
    badgeImg: "q3",
    questionImg: "q3",
    questionText: 'Who is Puss In Boots\'\s\nmost trusted companion?',
    options: [
      { img: "q3_option A", correct: true },
      { img: "q3_option B", correct: false },
    ],
    explanation:
      "Kitty Softpaws is Puss In Boots' most trusted companion. Cool and well-groomed. Kitty knows how to be persuasive without ever being a damsel in distress.",
  },
];

export default class QuizScene extends Phaser.Scene {
  constructor() {
    super({ key: "QuizScene" });
    this.currentQuestion = 0;
    this.score = 0;
  }

  preload() {
    this.load.image("bg", "assets/bg_1.jpg");
    this.load.image("logo", "assets/logo.png");
    this.load.image("question_box", "assets/question_box.png");
    this.load.image("q1", "assets/q1.png");
    this.load.image("q2", "assets/q2.png");
    this.load.image("q3", "assets/q3.png");
    this.load.image("q1_option A", "assets/q1_option A.png");
    this.load.image("q1_option B", "assets/q1_option B.png");
    this.load.image("q2_option A", "assets/q2_option A.png");
    this.load.image("q2_option B", "assets/q2_option B.png");
    this.load.image("q3_option A", "assets/q3_option A.png");
    this.load.image("q3_option B", "assets/q3_option B.png");
    this.load.image("btn_next", "assets/btn_next.png");
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  create() {
    const { width, height } = this.sys.game.canvas;
    this.add.image(width / 2, height / 2, "bg").setDisplaySize(width, height);
    this.add.image(width / 2, 80, "logo").setOrigin(0.5, 0.5).setScale(0.8).setDepth(80);
    this.cameras.main.fadeIn(500, 0, 0, 0);
    window.WebFont.load({
      custom: {
        families: ['BigCaslon', 'MinionPro', 'Caslon3LTStd'],
        urls: [
          'assets/fonts/BigCaslon.ttf',
          'assets/fonts/MinionPro-Regular.otf',
          'assets/fonts/Caslon3LTStd-Roman.otf',
        ],
      },
      active: () => {
        this.currentQuestion = 0;
        this.score = 0;
        this.showHeader();
        this.showQuestion();
      },
      inactive: () => {
        this.currentQuestion = 0;
        this.score = 0;
        this.showHeader();
        this.showQuestion();
      }
    });
  }

  showHeader() {
    const { width } = this.sys.game.canvas;
    const header = this.add.text(width / 2, 130, 'Quiz Time!\nCan you answer these questions?', {
      fontFamily: 'Caslon3LTStd',
      fontSize: '40px',
      color: '#fad105',
      align: 'center',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2,
      lineSpacing: 6,
      padding: { x: 0, y: 45 },
    }).setOrigin(0.5, 0);
    header.setAlpha(0);
    this.tweens.add({ targets: header, alpha: 1, duration: 600, delay: 200, ease: 'Sine.easeIn' });
  }

  showQuestion() {
    const { width, height } = this.sys.game.canvas;
    this.cleared && this.cleared();
    const qData = QUIZ_DATA[this.currentQuestion];
    // Responsive scaling factors
    const scaleFactor = Math.min(width / 800, height / 1200);
    const boxY = height / 2 + 90 * scaleFactor;
    const box = this.add.image(width / 2, boxY, "question_box").setDisplaySize(width * 0.8, height * 0.45 * scaleFactor);
    box.setAlpha(0);
    this.tweens.add({ targets: box, alpha: 1, duration: 500, delay: 100, ease: 'Sine.easeIn' });
    // Badge image always above the box
    let badgeBg = this.add.image(width / 2, boxY - box.displayHeight / 2 - 30 * scaleFactor, qData.badgeImg)
      .setOrigin(0.5, 0.5)
      .setScale(1.2 * scaleFactor);
    badgeBg.setAlpha(0);
    this.tweens.add({ targets: badgeBg, alpha: 1, duration: 500, delay: 250, ease: 'Sine.easeIn' });
    // Question text always centered in box
    let qText = this.add.text(width / 2, boxY - 40 * scaleFactor, qData.questionText, {
      fontFamily: 'MinionPro, serif',
      fontSize: `${Math.round(54 * scaleFactor)}px`,
      color: '#fff8e1',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 8 * scaleFactor,
      wordWrap: { width: width * 0.7 },
    }).setOrigin(0.5, 0.5);
    qText.setAlpha(0);
    this.tweens.add({ targets: qText, alpha: 1, duration: 500, delay: 400, ease: 'Sine.easeIn' });
    // Option images
    const optionSprites = [];
    const optionStartY = boxY + 30 * scaleFactor;
    const optionGap = 140 * scaleFactor;
    qData.options.forEach((opt, i) => {
      const y = optionStartY + i * optionGap;
      const btn = this.add.image(width / 2, y, opt.img)
        .setInteractive({ useHandCursor: true })
        .setOrigin(0.5, 0.5)
        .setScale(1.08 * scaleFactor);
      btn.setAlpha(0);
      this.tweens.add({ targets: btn, alpha: 1, duration: 500, delay: 600 + i * 120, ease: 'Sine.easeIn' });
      btn.on("pointerdown", () => this.handleAnswer(opt.correct));
      btn.on('pointerover', () => btn.setScale(1.13 * scaleFactor));
      btn.on('pointerout', () => btn.setScale(1.08 * scaleFactor));
      optionSprites.push(btn);
    });
    this.cleared = () => {
      box.destroy();
      if (badgeBg) badgeBg.destroy();
      if (qText) qText.destroy();
      optionSprites.forEach(btn => btn.destroy());
      this.cleared = null;
    };
  }

  handleAnswer(isCorrect) {
    if (isCorrect) this.score++;
    this.showFeedback(isCorrect);
  }

  showFeedback(isCorrect) {
    const { width, height } = this.sys.game.canvas;
    this.cleared && this.cleared();
    const qData = QUIZ_DATA[this.currentQuestion];
    const scaleFactor = Math.min(width / 800, height / 1200);
    const boxY = height / 2 + 90 * scaleFactor;
    const box = this.add.image(width / 2, boxY, "question_box").setDisplaySize(width * 0.8, height * 0.45 * scaleFactor);
    let badgeBg = this.add.image(width / 2, boxY - box.displayHeight / 2 - 30 * scaleFactor, qData.badgeImg)
      .setOrigin(0.5, 0.5)
      .setScale(1.2 * scaleFactor);
    // Large feedback text
    const resultText = this.add.text(width / 2, boxY - 110 * scaleFactor, isCorrect ? "Correct!" : "Incorrect!", {
      fontFamily: 'BigCaslon, serif',
      fontSize: `${Math.round(54 * scaleFactor)}px`,
      color: "#fff8e1",
      fontStyle: "bold",
      align: 'center',
      stroke: '#000',
      strokeThickness: 4 * scaleFactor,
      padding: { x: 0, y: -5 },
    }).setOrigin(0.5, 1.7);
    // Large explanation text
    const explain = this.add.text(width / 2, boxY + 10 * scaleFactor, qData.explanation, {
      fontFamily: 'MinionPro, serif',
      fontSize: `${Math.round(40 * scaleFactor)}px`,
      color: "#fff8e1",
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: width * 0.7 },
      lineSpacing: 10 * scaleFactor,
    }).setOrigin(0.5, 0.4);
    // Next button image below the question box
    const nextBtn = this.add.image(width / 2, boxY + box.displayHeight / 2 + 60 * scaleFactor, "btn_next")
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5, 0.4)
      .setScale(1.1 * scaleFactor)
      .setAlpha(0);
    this.tweens.add({ targets: [resultText, explain], alpha: 1, duration: 500, delay: 200, ease: 'Sine.easeIn' });
    this.tweens.add({ targets: nextBtn, alpha: 1, duration: 400, delay: 600, ease: 'Sine.easeIn' });
    nextBtn.on("pointerover", () => {
      this.tweens.add({
        targets: nextBtn,
        scale: 1.18 * scaleFactor,
        duration: 180,
        ease: 'Sine.easeInOut',
      });
      nextBtn.setTint(0xffffaa);
    });
    nextBtn.on("pointerout", () => {
      this.tweens.add({
        targets: nextBtn,
        scale: 1.13 * scaleFactor,
        duration: 180,
        ease: 'Sine.easeInOut',
      });
      nextBtn.clearTint();
    });
    nextBtn.on("pointerdown", () => {
      box.destroy();
      if (badgeBg) badgeBg.destroy();
      resultText.destroy();
      explain.destroy();
      nextBtn.destroy();
      this.currentQuestion++;
      if (this.currentQuestion < QUIZ_DATA.length) {
        this.showQuestion();
      } else {
        this.showScore();
      }
    });
    this.cleared = () => {
      box.destroy();
      if (badgeBg) badgeBg.destroy();
      resultText.destroy();
      explain.destroy();
      nextBtn.destroy();
      this.cleared = null;
    };
  }

  showScore() {
    const { width, height } = this.sys.game.canvas;
    const boxY = height / 2 + 100;
    const box = this.add.image(width / 2, boxY, "question_box").setDisplaySize(width * 0.8, height * 0.45);
    const badgeY = boxY - box.displayHeight / 2 - 20;
    const badgeBg = this.add.graphics();
    badgeBg.fillStyle(0xf7d08a, 1).fillRoundedRect(width / 2 - 48, badgeY - 28, 96, 56, 16).lineStyle(4, 0xaf7e2d, 1).strokeRoundedRect(width / 2 - 48, badgeY - 28, 96, 56, 16);
    const badge = this.add.text(width / 2, badgeY, 'Score', {
      fontFamily: 'Caslon3LTStd, serif',
      fontSize: '32px',
      color: '#af7e2d',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#af7e2d',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5);
    const scoreText = this.add.text(width / 2, boxY, `Your Score: ${this.score}/${QUIZ_DATA.length}`, {
      fontFamily: 'BigCaslon, serif',
      fontSize: "38px",
      color: "#fff8e1",
      fontStyle: "bold",
      align: 'center',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5);
    const continueBtnBg = this.add.graphics()
      .fillStyle(0xb8860b, 1)
      .fillRoundedRect(-80, -25, 160, 50, 25)
      .setPosition(width / 2, boxY + 80);
    const continueBtnText = this.add.text(width / 2, boxY + 80, "Continue", {
      fontFamily: 'BigCaslon, serif',
      fontSize: "32px",
      color: "#fff8e1",
      fontStyle: "bold",
      align: 'center',
    }).setOrigin(0.5, 0.5);
    const continueHitArea = new Phaser.Geom.Rectangle(-80, -25, 160, 50);
    continueBtnBg.setInteractive(continueHitArea, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    continueBtnBg.on("pointerdown", () => {
      this.scene.start("MemoryCardScene");
    });
    continueBtnBg.on('pointerover', () => {
      continueBtnBg.clear();
      continueBtnBg.fillStyle(0xdaa520, 1);
      continueBtnBg.fillRoundedRect(-80, -25, 160, 50, 25);
    });
    continueBtnBg.on('pointerout', () => {
      continueBtnBg.clear();
      continueBtnBg.fillStyle(0xb8860b, 1);
      continueBtnBg.fillRoundedRect(-80, -25, 160, 50, 25);
    });
    this.cleared = () => {
      box.destroy();
      badge.destroy();
      badgeBg.destroy();
      scoreText.destroy();
      continueBtnBg.destroy();
      continueBtnText.destroy();
      this.cleared = null;
    };
  }
}
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
    questionText: 'Who is a sidekick of Puss In Boots?',
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
    this.load.image("btn_letsgo", "assets/btn_letsgo.png");
    this.load.image("next challenge", "assets/next challenge.png");
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
    this.quizHeader = this.add.text(width / 2, 130, 'Quiz Time!\nCan you answer these questions?', {
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
    this.quizHeader.setAlpha(0);
    this.tweens.add({ targets: this.quizHeader, alpha: 1, duration: 600, delay: 200, ease: 'Sine.easeIn' });
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
    }).setOrigin(0.5, 1.2);
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
    const scaleFactor = Math.min(width / 800, height / 1200);
    // Remove any lingering header or question elements
    if (this.cleared) this.cleared();
    // Remove Quiz Time header if present
    if (this.quizHeader) { this.quizHeader.destroy(); this.quizHeader = null; }
    // Congratulatory text
    const congrats = this.add.text(width / 2, 200 * scaleFactor, 'Great job on the quiz!\nYour correct answers are', {
      fontFamily: 'Caslon3LTStd',
      fontSize: `${Math.round(38 * scaleFactor)}px`,
      color: '#fad105',
      align: 'center',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2 * scaleFactor,
      lineSpacing: 8 * scaleFactor,
    }).setOrigin(0.5, 0.25);
    // Score
    const scoreText = this.add.text(width / 2, 270 * scaleFactor, `${this.score}/${QUIZ_DATA.length}`, {
      fontFamily: 'BigCaslon, serif',
      fontSize: `${Math.round(80 * scaleFactor)}px`,
      color: '#fff8e1',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000',
      strokeThickness: 4 * scaleFactor,
    }).setOrigin(0.5, -0.75);
    // Parchment background
    const parchment = this.add.image(width / 2, 480 * scaleFactor, 'next challenge').setOrigin(0.5, 0).setScale(4.5 * scaleFactor);
    parchment.setDisplaySize(width * 0.9, height * 0.4);
    // Challenge heading
    // const challengeHeading = this.add.text(width / 2, 410 * scaleFactor, '', {
    //   fontFamily: 'BigCaslon, serif',
    //   fontSize: `${Math.round(32 * scaleFactor)}px`,
    //   color: '#222',
    //   fontStyle: 'bold',
    //   align: 'center',
    //   stroke: '#fff8e1',
    //   strokeThickness: 0,
    // }).setOrigin(0.5, 0.5);
    // // Challenge description
    // const challengeDesc = this.add.text(width / 2, 480 * scaleFactor, '', {
    //   fontFamily: 'MinionPro, serif',
    //   fontSize: `${Math.round(26 * scaleFactor)}px`,
    //   color: '#222',
    //   align: 'center',
    //   wordWrap: { width: width * 0.5 },
    //   lineSpacing: 6 * scaleFactor,
      
    // })
    // .setOrigin(0.5, -2.5)
    // .setScale(1.4 * scaleFactor);
    // Let's go button
    const letsGoBtn = this.add.image(width / 2, 650 * scaleFactor, 'btn_letsgo')
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5, -2.3)
      .setScale(1.5 * scaleFactor);
    letsGoBtn.on('pointerover', () => {
      this.tweens.add({
        targets: letsGoBtn,
        scale: 1.18 * scaleFactor,
        duration: 180,
        ease: 'Sine.easeInOut',
      });
      letsGoBtn.setTint(0xffffaa);
    });
    letsGoBtn.on('pointerout', () => {
      this.tweens.add({
        targets: letsGoBtn,
        scale: 1.1 * scaleFactor,
        duration: 180,
        ease: 'Sine.easeInOut',
      });
      letsGoBtn.clearTint();
    });
    letsGoBtn.on('pointerdown', () => {
      this.scene.start('MemoryCardScene');
    });
    this.cleared = () => {
      congrats.destroy();
      scoreText.destroy();
      parchment.destroy();
      letsGoBtn.destroy();
      this.cleared = null;
    };
  }
}
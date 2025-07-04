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
    this.particles = [];
    this.magicOrbs = [];
    this.starField = [];
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
    
    this.createParallaxBackground(width, height);
    
    this.createStarField(width, height);
    
    this.createMagicalOrbs(width, height);
    
    this.createAnimatedLogo(width, height);
    
    this.cameras.main.fadeIn(800, 0, 0, 0);
    
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

  createParallaxBackground(width, height) {
    this.bgLayer1 = this.add.image(width / 2, height / 2, "bg")
      .setDisplaySize(width * 1.1, height * 1.1)
      .setAlpha(0.9);
    
    this.tweens.add({
      targets: this.bgLayer1,
      x: width / 2 + 20,
      y: height / 2 + 10,
      duration: 8000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createStarField(width, height) {
    for (let i = 0; i < 30; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.8)
      );
      
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000)
      });
      
      this.starField.push(star);
    }
  }

  createMagicalOrbs(width, height) {
    for (let i = 0; i < 8; i++) {
      const orb = this.add.circle(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(50, height - 50),
        Phaser.Math.Between(8, 15),
        0xfad105,
        0.4
      );
      
      orb.setBlendMode(Phaser.BlendModes.ADD);
      
      this.tweens.add({
        targets: orb,
        x: orb.x + Phaser.Math.Between(-100, 100),
        y: orb.y + Phaser.Math.Between(-80, 80),
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 3000)
      });
      
      this.tweens.add({
        targets: orb,
        alpha: 0.1,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000)
      });
      
      this.magicOrbs.push(orb);
    }
  }

  createAnimatedLogo(width, height) {
    this.logo = this.add.image(width / 2, -100, "logo")
      .setOrigin(0.5, 0.5)
      .setScale(0.8)
      .setDepth(80);
    
    this.tweens.add({
      targets: this.logo,
      y: 80,
      duration: 1200,
      ease: 'Bounce.easeOut',
      delay: 300
    });
    
    this.tweens.add({
      targets: this.logo,
      y: 85,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 1500
    });
    
    // Gentle rotation
    this.tweens.add({
      targets: this.logo,
      rotation: 0.05,
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 2000
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
      strokeThickness: 3,
      lineSpacing: 6,
      padding: { x: 0, y: 45 },
    }).setOrigin(0.5, 0);
    
    this.quizHeader.setAlpha(0).setScale(0.5);
    
    this.tweens.add({
      targets: this.quizHeader,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 800,
      delay: 600,
      ease: 'Back.easeOut'
    });
    
    this.tweens.add({
      targets: this.quizHeader,
      alpha: 0.7,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 1400
    });
  }

  showQuestion() {
    const { width, height } = this.sys.game.canvas;
    this.cleared && this.cleared();
    const qData = QUIZ_DATA[this.currentQuestion];
    const scaleFactor = Math.min(width / 800, height / 1200);
    const boxY = height / 2 + 90 * scaleFactor;
    
    const box = this.add.image(width / 2, boxY, "question_box")
      .setDisplaySize(width * 0.8, height * 0.45 * scaleFactor);
    
    box.setAlpha(0).setScale(0.3);
    
    this.tweens.add({
      targets: box,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      delay: 200,
      ease: 'Back.easeOut'
    });
    
    this.tweens.add({
      targets: box,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 800
    });
    
    // Badge with rotation entrance
    let badgeBg = this.add.image(width / 2, boxY - box.displayHeight / 2 - 30 * scaleFactor, qData.badgeImg)
      .setOrigin(0.5, 1.6)
      .setScale(1.2 * scaleFactor);
    
    badgeBg.setAlpha(0).setRotation(Math.PI * 2);
    
    this.tweens.add({
      targets: badgeBg,
      alpha: 1,
      rotation: 0,
      duration: 800,
      delay: 400,
      ease: 'Back.easeOut'
    });
    
    this.tweens.add({
      targets: badgeBg,
      y: badgeBg.y - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 1200
    });
    
    let qText = this.add.text(width / 2, boxY - 40 * scaleFactor, '', {
      fontFamily: 'MinionPro, serif',
      fontSize: `${Math.round(54 * scaleFactor)}px`,
      color: '#fff8e1',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 8 * scaleFactor,
      wordWrap: { width: width * 0.7 },
    }).setOrigin(0.5, 1.2);
    
    // Typewriter effect
    this.typewriterText(qText, qData.questionText, 600);
    
    // Options with staggered entrance
    const optionSprites = [];
    const optionStartY = boxY + 30 * scaleFactor;
    const optionGap = 140 * scaleFactor;
    
    qData.options.forEach((opt, i) => {
      const y = optionStartY + i * optionGap;
      const btn = this.add.image(width / 2, y, opt.img)
        .setInteractive({ useHandCursor: true })
        .setOrigin(0.5, 0.5)
        .setScale(1.08 * scaleFactor);
      
      btn.setAlpha(0).setX(width / 2 + (i % 2 === 0 ? -300 : 300));
      
      this.tweens.add({
        targets: btn,
        alpha: 1,
        x: width / 2,
        duration: 600,
        delay: 800 + i * 200,
        ease: 'Back.easeOut'
      });
      
      btn.on('pointerover', () => {
        this.tweens.add({
          targets: btn,
          scaleX: 1.18 * scaleFactor,
          scaleY: 1.18 * scaleFactor,
          duration: 200,
          ease: 'Sine.easeOut'
        });
        
        btn.setTint(0xffffcc);
        this.createHoverParticles(btn.x, btn.y);
      });
      
      btn.on('pointerout', () => {
        this.tweens.add({
          targets: btn,
          scaleX: 1.08 * scaleFactor,
          scaleY: 1.08 * scaleFactor,
          duration: 200,
          ease: 'Sine.easeOut'
        });
        
        btn.clearTint();
      });
      
      btn.on("pointerdown", () => {
        this.createClickEffect(btn.x, btn.y);
        this.handleAnswer(opt.correct);
      });
      
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

  typewriterText(textObject, fullText, startDelay) {
    let currentText = '';
    let charIndex = 0;
    
    const timer = this.time.addEvent({
      delay: 50,
      callback: () => {
        if (charIndex < fullText.length) {
          currentText += fullText[charIndex];
          textObject.setText(currentText);
          charIndex++;
        } else {
          timer.remove();
        }
      },
      repeat: fullText.length - 1,
      startAt: startDelay
    });
  }
  createVictoryEffect() {
  const { width, height } = this.sys.game.canvas;
  
  const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xffd700, 0.3);
  this.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 800,
    ease: 'Sine.easeOut',
    onComplete: () => flash.destroy()
  });
  
  for (let i = 0; i < 50; i++) {
    const colors = [0xffd700, 0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b];
    const particle = this.add.circle(
      width / 2 + Phaser.Math.Between(-50, 50),
      height / 2 + Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(3, 8),
      colors[Phaser.Math.Between(0, colors.length - 1)],
      0.9
    );
    
    const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
    const speed = Phaser.Math.Between(200, 500);
    
    this.tweens.add({
      targets: particle,
      x: width / 2 + Math.cos(angle) * speed,
      y: height / 2 + Math.sin(angle) * speed,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      rotation: Phaser.Math.Between(0, 360) * Math.PI / 180,
      duration: Phaser.Math.Between(1000, 2000),
      ease: 'Sine.easeOut',
      onComplete: () => particle.destroy()
    });
  }
  
  for (let i = 0; i < 20; i++) {
    const sparkle = this.add.circle(
      Phaser.Math.Between(0, width),
      Phaser.Math.Between(0, height),
      Phaser.Math.Between(2, 4),
      0xffffff,
      0.8
    );
    
    this.tweens.add({
      targets: sparkle,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: Phaser.Math.Between(800, 1500),
      delay: Phaser.Math.Between(0, 1000),
      ease: 'Sine.easeOut',
      onComplete: () => sparkle.destroy()
    });
  }
}

  createHoverParticles(x, y) {
    for (let i = 0; i < 5; i++) {
      const particle = this.add.circle(
        x + Phaser.Math.Between(-20, 20),
        y + Phaser.Math.Between(-20, 20),
        Phaser.Math.Between(2, 4),
        0xfad105,
        0.8
      );
      
      this.tweens.add({
        targets: particle,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        y: y - 50,
        duration: 800,
        ease: 'Sine.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  createClickEffect(x, y) {
    const ripple = this.add.circle(x, y, 10, 0xffffff, 0.3);
    ripple.setBlendMode(Phaser.BlendModes.ADD);
    
    this.tweens.add({
      targets: ripple,
      scaleX: 8,
      scaleY: 8,
      alpha: 0,
      duration: 500,
      ease: 'Sine.easeOut',
      onComplete: () => ripple.destroy()
    });
    
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = this.add.circle(x, y, 3, 0xfad105, 0.9);
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 80,
        y: y + Math.sin(angle) * 80,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 600,
        ease: 'Sine.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  handleAnswer(isCorrect) {
    if (isCorrect) {
      this.score++;
      this.createSuccessEffect();
    } else {
      this.createFailEffect();
    }
    
    this.time.delayedCall(800, () => {
      this.showFeedback(isCorrect);
    });
  }

  createSuccessEffect() {
    const { width, height } = this.sys.game.canvas;
    
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0x00ff00, 0.3);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });
    
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        width / 2,
        height / 2,
        Phaser.Math.Between(3, 8),
        Phaser.Math.Between(0x00ff00, 0xffff00),
        0.9
      );
      
      const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
      const speed = Phaser.Math.Between(100, 300);
      
      this.tweens.add({
        targets: particle,
        x: width / 2 + Math.cos(angle) * speed,
        y: height / 2 + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 1000,
        ease: 'Sine.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  createFailEffect() {
    const { width, height } = this.sys.game.canvas;
    
    this.cameras.main.shake(300, 0.01);
    
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xff0000, 0.2);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      onComplete: () => flash.destroy()
    });
  }

  showFeedback(isCorrect) {
    const { width, height } = this.sys.game.canvas;
    this.cleared && this.cleared();
    const qData = QUIZ_DATA[this.currentQuestion];
    const scaleFactor = Math.min(width / 800, height / 1200);
    const boxY = height / 2 + 90 * scaleFactor;
    
    const box = this.add.image(width / 2, boxY, "question_box")
      .setDisplaySize(width * 0.8, height * 0.45 * scaleFactor);
    
    box.setAlpha(0).setScale(0.8);
    
    this.tweens.add({
      targets: box,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    let badgeBg = this.add.image(width / 2, boxY - box.displayHeight / 2 - 30 * scaleFactor, qData.badgeImg)
      .setOrigin(0.5, 0.75)
      .setScale(1.2 * scaleFactor);
    
    const resultText = this.add.text(width / 2, boxY - 110 * scaleFactor, isCorrect ? "Correct!" : "Incorrect!", {
      fontFamily: 'BigCaslon, serif',
      fontSize: `${Math.round(54 * scaleFactor)}px`,
      color: isCorrect ? "#00ff00" : "#ff6666",
      fontStyle: "bold",
      align: 'center',
      stroke: '#000',
      strokeThickness: 4 * scaleFactor,
      padding: { x: 0, y: -5 },
    }).setOrigin(0.5, 1.7);
    
    resultText.setAlpha(0).setScale(0.5);
    
    this.tweens.add({
      targets: resultText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      delay: 200,
      ease: 'Back.easeOut'
    });
    
    const explain = this.add.text(width / 2, boxY + 10 * scaleFactor, qData.explanation, {
      fontFamily: 'MinionPro, serif',
      fontSize: `${Math.round(40 * scaleFactor)}px`,
      color: "#fff8e1",
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: width * 0.7 },
      lineSpacing: 10 * scaleFactor,
    }).setOrigin(0.5, 0.4);
    
    explain.setAlpha(0);
    
    this.tweens.add({
      targets: explain,
      alpha: 1,
      duration: 800,
      delay: 600,
      ease: 'Sine.easeIn'
    });
    
    // Next button with special effects
    const nextBtn = this.add.image(width / 2, boxY + box.displayHeight / 2 + 60 * scaleFactor, "btn_next")
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5, 0.4)
      .setScale(1.1 * scaleFactor)
      .setAlpha(0);
    
    this.tweens.add({
      targets: nextBtn,
      alpha: 1,
      duration: 500,
      delay: 1000,
      ease: 'Sine.easeIn'
    });
    
    nextBtn.on("pointerover", () => {
      this.tweens.add({
        targets: nextBtn,
        scale: 1.25 * scaleFactor,
        duration: 200,
        ease: 'Sine.easeOut',
      });
      nextBtn.setTint(0xffffaa);
      this.createButtonGlow(nextBtn);
    });
    
    nextBtn.on("pointerout", () => {
      this.tweens.add({
        targets: nextBtn,
        scale: 1.1 * scaleFactor,
        duration: 200,
        ease: 'Sine.easeOut',
      });
      nextBtn.clearTint();
    });
    
    nextBtn.on("pointerdown", () => {
      this.createClickEffect(nextBtn.x, nextBtn.y);
      
      this.tweens.add({
        targets: [box, badgeBg, resultText, explain, nextBtn],
        alpha: 0,
        x: width + 200,
        duration: 500,
        ease: 'Sine.easeIn',
        onComplete: () => {
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
        }
      });
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

  createButtonGlow(button) {
    const glow = this.add.circle(button.x, button.y, 50, 0xffffff, 0.3);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    
    this.tweens.add({
      targets: glow,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 500,
      ease: 'Sine.easeOut',
      onComplete: () => glow.destroy()
    });
  }

  showScore() {
    const { width, height } = this.sys.game.canvas;
    const scaleFactor = Math.min(width / 800, height / 1200);
    
    // Clear everything
    if (this.cleared) this.cleared();
    if (this.quizHeader) { this.quizHeader.destroy(); this.quizHeader = null; }
    
    this.createVictoryEffect();
    
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
    
    congrats.setAlpha(0).setY(congrats.y - 100);
    
    this.tweens.add({
      targets: congrats,
      alpha: 1,
      y: 200 * scaleFactor,
      duration: 800,
      delay: 500,
      ease: 'Back.easeOut'
    });
    
    const scoreText = this.add.text(width / 2, 270 * scaleFactor, '0/' + QUIZ_DATA.length, {
      fontFamily: 'BigCaslon, serif',
      fontSize: `${Math.round(80 * scaleFactor)}px`,
      color: '#fff8e1',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000',
      strokeThickness: 4 * scaleFactor,
    }).setOrigin(0.5, -0.75);
    
    scoreText.setAlpha(0).setScale(0.5);
    
    this.tweens.add({
      targets: scoreText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      delay: 800,
      ease: 'Back.easeOut'
    });
    
    let currentScore = 0;
    const scoreTimer = this.time.addEvent({
      delay: 100,
      callback: () => {
        if (currentScore <= this.score) {
          scoreText.setText(currentScore + '/' + QUIZ_DATA.length);
          if (currentScore === this.score) {
            scoreTimer.remove();
            // Pulse effect when final score is reached
            this.tweens.add({
              targets: scoreText,
              scaleX: 1.2,
              scaleY: 1.2,
              duration: 300,
              yoyo: true,
              ease: 'Sine.easeInOut'
            });
          }
          currentScore++;
        }
      },
      repeat: this.score,
      startAt: 1200
    });
    
      const parchment = this.add.image(width / 2, 1 * scaleFactor, 'next challenge')
        .setOrigin(0.5, -1)
        .setScale(1 * scaleFactor);

      parchment.setDisplaySize(width * 0.9, height * 0.4);
      parchment.setAlpha(0).setRotation(0.1);

      this.tweens.add({
        targets: parchment,
        alpha: 1,
        rotation: 0,
        scaleX: 1 * scaleFactor,
        scaleY: 1 * scaleFactor,
        duration: 1000,
        delay: 1400,
        ease: 'Back.easeOut'
      });

      this.tweens.add({
        targets: parchment,
        scaleX: 1 * scaleFactor,
        scaleY: 1 * scaleFactor,
        duration: 4000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: 2500
      });

      const challengeHeading = this.add.text(width / 2, 0.2 * scaleFactor, '', {
        fontFamily: 'BigCaslon, serif',
        fontSize: `${Math.round(32 * scaleFactor)}px`,
        color: '#2c1810',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#fff8e1',
        strokeThickness: 1,
      }).setOrigin(0.5, 0.5);

      const challengeDesc = this.add.text(width / 2, 0.2 * scaleFactor, '', {
        fontFamily: 'MinionPro, serif',
        fontSize: `${Math.round(26 * scaleFactor)}px`,
        color: '#2c1810',
        align: 'center',
        wordWrap: { width: width * 0.5 },
        lineSpacing: 6 * scaleFactor,
      })
      .setOrigin(0.5, -2.5)
      .setScale(1.4 * scaleFactor);

      // Let's go button with spectacular entrance
      const letsGoBtn = this.add.image(width / 2, 650 * scaleFactor, 'btn_letsgo')
        .setInteractive({ useHandCursor: true })
        .setOrigin(0.5, -2.3)
        .setScale(0.5 * scaleFactor);

      letsGoBtn.setAlpha(0).setY(650 * scaleFactor + 100);

      this.tweens.add({
        targets: letsGoBtn,
        alpha: 1,
        y: 650 * scaleFactor,
        scaleX: 1.5 * scaleFactor,
        scaleY: 1.5 * scaleFactor,
        duration: 800,
        delay: 2800,
        ease: 'Bounce.easeOut'
      });

      this.tweens.add({
        targets: letsGoBtn,
        scaleX: 1.6 * scaleFactor,
        scaleY: 1.6 * scaleFactor,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: 3600
      });

      letsGoBtn.on('pointerover', () => {
        this.tweens.add({
          targets: letsGoBtn,
          scaleX: 1.8 * scaleFactor,
          scaleY: 1.8 * scaleFactor,
          duration: 200,
          ease: 'Sine.easeOut',
        });
        letsGoBtn.setTint(0xffffaa);
        
        this.createHoverParticles(letsGoBtn.x, letsGoBtn.y);
        
        this.createButtonGlow(letsGoBtn);
      });

      letsGoBtn.on('pointerout', () => {
        this.tweens.add({
          targets: letsGoBtn,
          scaleX: 1.5 * scaleFactor,
          scaleY: 1.5 * scaleFactor,
          duration: 200,
          ease: 'Sine.easeOut',
        });
        letsGoBtn.clearTint();
      });

      letsGoBtn.on('pointerdown', () => {
        this.createClickEffect(letsGoBtn.x, letsGoBtn.y);
        
        this.cameras.main.fadeOut(600, 0, 0, 0);
        
        this.time.delayedCall(700, () => {
          this.scene.start('MemoryCardScene');
        });
      });

      // Update cleared function to include new elements
      this.cleared = () => {
        congrats.destroy();
        scoreText.destroy();
        parchment.destroy();
        if (challengeHeading) challengeHeading.destroy();
        if (challengeDesc) challengeDesc.destroy();
        letsGoBtn.destroy();
        this.cleared = null;
      };
  }
  
}
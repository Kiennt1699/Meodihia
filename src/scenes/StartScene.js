import Phaser from "phaser";

export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });
  }

  preload() {
    const { width, height } = this.sys.game.canvas;
    // Loading bar
    const loadingBarBg = this.add.graphics();
    loadingBarBg.fillStyle(0xaf7e2d, 0.6);
    loadingBarBg.fillRect(width / 4 - 4, height / 2 - 4, width / 2 + 8, 38);
    const loadingBar = this.add.graphics();
    // Animate loading bar from 0 to 100% regardless of asset loading
    let progress = 0;
    // Add loading text below the bar
    const loadingText = this.add.text(width / 2, height / 2 + 40, 'Loading 100%', {
      font: '24px Arial',
      fill: '#af7e2d',
      fontWeight: 'bold',
    }).setOrigin(0.5, 0);
    this.time.addEvent({
      delay: 8, // speed up for a quick full bar
      repeat: 124, // 125 steps for smoothness
      callback: () => {
        progress += 0.1;
        loadingBar.clear();
        loadingBar.fillStyle(0xaf7e2d, 1);
        loadingBar.fillRect(width / 4, height / 2, (width / 2) * Math.min(progress, 1), 30);
      },
      callbackScope: this,
    });
    // Remove loading bar and text after 1.5s
    this.time.delayedCall(1500, () => {
      loadingBar.destroy();
      loadingBarBg.destroy();
      loadingText.destroy();
    });
    // Load assets
    this.load.image("bg", "assets/bg_1.jpg");
    this.load.image("logo", "assets/logo.png");
    this.load.image("puss", "assets/s1_puss.png");
    this.load.image("kitty", "assets/s1_kitty.png");
    this.load.image("perro", "assets/s1_perro.png");
    this.load.image("playnow", "assets/btn_playnow.png");
    this.load.audio('bgm', 'assets/bgm.mp3'); 
    // ...load other assets as needed
  }

  create() {
    if (!this.sound.get('bgm')) {
    const music = this.sound.add('bgm', {
      loop: true,
      volume: 0.5 // chỉnh âm lượng nếu muốn
    });
    music.play();
}
    const { width, height } = this.sys.game.canvas;
    this.add.image(width / 2, height / 2, "bg").setDisplaySize(width, height);

    // Logo lớn, căn giữa, trên cùng
    this.add.image(width / 2, 120, "logo")
      .setOrigin(0.5, 0.5)
      .setScale(1.1) // Điều chỉnh scale cho vừa
      .setDepth(100);

    const chars = [
      {
        key: "puss",
        targetX: width / 2 + 10, // ngoài cùng phải
        targetY: height / 2 + 50,
        scale: 1.4,
        depth: 3,
      },
      {
        key: "kitty",
        targetX: width / 2 + 110, // lùi trái, lộ 1/2
        targetY: height / 2 + 80,
        scale: 1.13,
        depth: 2,
      },
      {
        key: "perro",
        targetX: width / 2 + 20, // lùi trái nữa, lộ 1/3
        targetY: height / 2 + 10,
        scale: 1.05,
        depth: 1,
      },
    ];

    let idx = 0;

    const showNextChar = () => {
      if (idx < chars.length) {
        const char = chars[idx];
        const startX = width + 250;
        const sprite = this.add.image(startX, char.targetY, char.key)
          .setAlpha(0)
          .setScale(char.scale)
          .setDepth(char.depth)
          .setOrigin(0.5, 0.5);

        this.tweens.add({
          targets: sprite,
          x: char.targetX,
          alpha: 1,
          duration: 650,
          ease: "Cubic.easeOut",
          onComplete: () => {
            idx++;
            this.time.delayedCall(120, showNextChar);
          },
        });
      } else {
        // Show Play Now button centered at the bottom
        const playBtn = this.add.image(width / 2, height - 100, "playnow")
          .setInteractive({ useHandCursor: true })
          .setScale(1)
          .setDepth(10);
        // Looping zoom in-out animation
        this.tweens.add({
          targets: playBtn,
          scale: 1.1,
          duration: 700,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        // Hover effect
        playBtn.on("pointerover", () => {
          this.tweens.add({
            targets: playBtn,
            scale: 1.18,
            duration: 180,
            ease: 'Sine.easeInOut',
          });
          playBtn.setTint(0xffffaa);
        });
        playBtn.on("pointerout", () => {
          this.tweens.add({
            targets: playBtn,
            scale: 1.13,
            duration: 180,
            ease: 'Sine.easeInOut',
          });
          playBtn.clearTint();
        });
        playBtn.on("pointerdown", () => {
          this.scene.start("QuizScene");
        });
      }
    };
    showNextChar();
  }
}
import Phaser from "phaser";

const CHARACTERS = [
  {
    key: "puss_3",
    img: "Card/card_char1_puss.png",
    name: "Puss In Boots",
    desc: "A hero to some, an outlaw to others...everyone agrees that this swashbuckling cat has style to spare. Known for his iconic boots, Puss is a skilled swordsman, charming, fearless, determined and a crazy-good dancer."
  },
  {
    key: "kitty_3",
    img: "Card/card_char2_kitty.png",
    name: "Kitty Softpaws",
    desc: "A street-smart, quick-witted cat with a mysterious past. Kitty is agile, clever, and always ready for adventure."
  },
  {
    key: "perro_3",
    img: "Card/card_char3_perro.png",
    name: "Perro",
    desc: "A loyal and optimistic dog who always sees the best in everyone. Perro is a true friend and a source of comic relief."
  },
  {
    key: "goldilocks_3",
    img: "Card/card_char4_goldilocks.png",
    name: "Goldilocks",
    desc: "A tough and resourceful girl with a heart of gold. Goldilocks is a leader and fiercely protective of her family."
  },
  {
    key: "bear_3",
    img: "Card/card_char5_bear.png",
    name: "Papa Bear",
    desc: "Strong and dependable, Papa Bear is the backbone of the bear family. He is gentle but can be fierce when needed."
  },
  {
    key: "wolf_3",
    img: "Card/card_char6_wolf.png",
    name: "The Wolf",
    desc: "A mysterious and formidable figure, The Wolf is both feared and respected. His presence always signals a challenge."
  }
];

export default class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: "EndScene" });
    this.currentChar = 0;
    this.isWin = false;
    this.isMuted = false;
  }

  init(data) {
    this.isWin = data && data.isWin;
  }

  preload() {
    this.load.image("bg1", "public/assets/bg_1.jpg");
    this.load.image("logo", "public/assets/logo.png");
    this.load.image("tvc_frame", "public/assets/tvc_frame.png");
    this.load.image("arrow_left", "public/assets/arrow_left.png");
    this.load.image("arrow_right", "public/assets/arrow_right.png");
    this.load.image("btn_playagain", "public/assets/btn_playagain.png");
    this.load.image("btn_discovermore", "public/assets/btn_discover more.png");
    this.load.image("btn_mute", "public/assets/btn_mute.png");
    this.load.image("btn_unmute", "public/assets/btn_unmute.png");
    this.load.image("btn_reload", "public/assets/btn_reload.png");
    this.load.video("pib_video", "public/assets/video/tvc_video_pussinboots.mp4", "loadeddata", false, true);
    CHARACTERS.forEach(c => this.load.image(c.key, `public/assets/${c.img}`));
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const canvasWidth = this.cameras.main.width;
    const canvasHeight = this.cameras.main.height;

    this.add.image(centerX, centerY, "bg1").setDisplaySize(canvasWidth, canvasHeight);
    this.add.image(centerX, 70, "logo").setScale(0.6);

    // Result text (positioned below logo with more spacing)
    this.resultText = this.add.text(centerX, 160,
      this.isWin
        ? "Congratulations!\nYou've matched all the pairs"
        : "Try again!\nYou haven't matched all the pairs",
      {
        fontFamily: "Arial",
        fontSize: Math.round(canvasWidth * 0.045) + "px",
        fontStyle: "bold",
        color: "#ffe600",
        align: "center",
        stroke: "#000",
        strokeThickness: 4,
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 4, fill: true },
        wordWrap: { width: Math.round(canvasWidth * 0.8) }
      }
    ).setOrigin(0.5, 0.25);

    // TVC frame and video (smaller size and moved closer to result text)
    const tvcFrameY = this.resultText.y + 250; // Closer to result text
    const tvcFrameWidth = Math.round(canvasWidth * 0.65); // Smaller frame
    const tvcFrameHeight = Math.round(tvcFrameWidth * 0.7); // Better aspect ratio for frame
    
    this.add.image(centerX, tvcFrameY, "tvc_frame")
      .setDisplaySize(tvcFrameWidth, tvcFrameHeight)
      .setDepth(1);

    // Video sized to fit properly within frame with proper padding
    const videoPadding = 100;
    const videoWidth = tvcFrameWidth - videoPadding * 3.2;
    const videoHeight = tvcFrameHeight - videoPadding * 1.3;
    
    this.phaserVideo = this.add.video(centerX, tvcFrameY, "pib_video")
      .setDisplaySize(videoWidth, videoHeight)
      .setDepth(2)
      .setOrigin(0.5, 0.5);
    
    // Video controls - manual play/pause instead of auto-reload
    this.phaserVideo.play(false); 
    this.phaserVideo.setPaused(false);
    this.phaserVideo.setMute(false);

    // Reload button (manual replay)
    this.reloadBtn = this.add.image(centerX, tvcFrameY, "btn_reload")
      .setInteractive()
      .setScale(0.5)
      .setDepth(4)
      .setVisible(false);
    
    this.reloadBtn.on("pointerdown", () => {
      this.phaserVideo.setCurrentTime(0);
      this.phaserVideo.play(false);
      this.reloadBtn.setVisible(false);
    });

    // Mute/Unmute button (single button, always reflects current mute state)
    this.muteBtn = this.add.image(
      centerX + tvcFrameWidth / 2 - 28, 
      tvcFrameY - tvcFrameHeight / 2 + 28, 
      this.isMuted ? "btn_mute" : "btn_unmute"
    )
      .setInteractive()
      .setScale(0.4)
      .setDepth(4);
    
    this.muteBtn.on("pointerdown", () => {
      this.isMuted = !this.isMuted;
      this.phaserVideo.setMute(this.isMuted);
      this.muteBtn.setTexture(this.isMuted ? "btn_unmute" : "btn_mute");
    });

    // Ensure mute button always reflects current state after video events
    this.phaserVideo.on("complete", () => {
      this.reloadBtn.setVisible(true);
      this.muteBtn.setTexture(this.isMuted ? "btn_unmute" : "btn_mute");
    });
    this.phaserVideo.on("play", () => {
      this.reloadBtn.setVisible(false);
      this.muteBtn.setTexture(this.isMuted ? "btn_unmute" : "btn_mute");
    });

    // Character Card Carousel (larger size and prominent position)
    const cardY = tvcFrameY + tvcFrameHeight / 2 + 80;
    const cardWidth = Math.round(canvasWidth * 0.5); // Larger card size
    const cardHeight = Math.round(cardWidth * 0.6); // Better proportions
    this.createCarousel(centerX, cardY, cardWidth, cardHeight);

    // Buttons (positioned at bottom with proper spacing)
    const buttonY = canvasHeight - 70;
    this.createButtons(centerX, buttonY);
  }

  createCarousel(centerX, cardY, cardW, cardH) {
    // Card image (centered and prominent)
    this.charImg = this.add.image(centerX, cardY, CHARACTERS[0].key)
      .setDisplaySize(cardW, cardH)
      .setDepth(3)
      .setScale(1.02)
      .setOrigin(0.5, 0);
      

    // Arrows (positioned to the sides of card with proper spacing)
    const arrowOffset = cardW / 2 + 150; // More space for larger cards
    this.arrowLeft = this.add.image(centerX - arrowOffset, cardY, "arrow_left")
      .setInteractive()
      .setScale(1.2)
      .setOrigin(0.5, -0.35)
      .setDepth(4);
    
    this.arrowRight = this.add.image(centerX + arrowOffset, cardY, "arrow_right")
      .setInteractive()
      .setScale(1.2)
      .setOrigin(0.5, -0.35)
      .setDepth(4);
    
    this.arrowLeft.on("pointerdown", () => this.switchChar(-1));
    this.arrowRight.on("pointerdown", () => this.switchChar(1));

    // Add hover effects for arrows
    this.arrowLeft.on("pointerover", () => this.arrowLeft.setScale(1.3));
    this.arrowLeft.on("pointerout", () => this.arrowLeft.setScale(1.2));
    this.arrowRight.on("pointerover", () => this.arrowRight.setScale(1.3));
    this.arrowRight.on("pointerout", () => this.arrowRight.setScale(1.2));
  }

  switchChar(dir) {
    this.currentChar = (this.currentChar + dir + CHARACTERS.length) % CHARACTERS.length;
    const c = CHARACTERS[this.currentChar];
    this.charImg.setTexture(c.key);
  }

  createButtons(centerX, btnY) {
    // Play Again (left)
    this.playAgainBtn = this.add.image(centerX - 150, btnY, "btn_playagain")
      .setInteractive()
      .setScale(0.9);
    
    this.playAgainBtn.on("pointerdown", () => {
      this.scene.start("MemoryCardScene");
    });

    // Discover More (right)
    this.discoverMoreBtn = this.add.image(centerX + 150, btnY, "btn_discovermore")
      .setInteractive()
      .setScale(0.9);
    
    // Add hover effects for buttons
    this.playAgainBtn.on("pointerover", () => this.playAgainBtn.setScale(0.85));
    this.playAgainBtn.on("pointerout", () => this.playAgainBtn.setScale(0.8));
    this.discoverMoreBtn.on("pointerover", () => this.discoverMoreBtn.setScale(0.85));
    this.discoverMoreBtn.on("pointerout", () => this.discoverMoreBtn.setScale(0.8));
  }
}
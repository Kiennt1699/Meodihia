import Phaser from "phaser";

const CHARACTERS = [
  {
    key: "puss_3",
    img: "Characters/card_char1_puss.png",
    name: "Puss In Boots",
    desc: "A hero to some, an outlaw to others...everyone agrees that this swashbuckling cat has style to spare. Known for his iconic boots, Puss is a skilled swordsman, charming, fearless, determined and a crazy-good dancer."
  },
  {
    key: "kitty_3",
    img: "Characters/card_char2_kitty.png",
    name: "Kitty Softpaws",
    desc: "A street-smart, quick-witted cat with a mysterious past. Kitty is agile, clever, and always ready for adventure."
  },
  {
    key: "perro_3",
    img: "Characters/card_char3_perro.png",
    name: "Perro",
    desc: "A loyal and optimistic dog who always sees the best in everyone. Perro is a true friend and a source of comic relief."
  },
  {
    key: "goldilocks_3",
    img: "Characters/card_char4_goldilocks.png",
    name: "Goldilocks",
    desc: "A tough and resourceful girl with a heart of gold. Goldilocks is a leader and fiercely protective of her family."
  },
  {
    key: "bear_3",
    img: "Characters/card_char5_bear.png",
    name: "Papa Bear",
    desc: "Strong and dependable, Papa Bear is the backbone of the bear family. He is gentle but can be fierce when needed."
  },
  {
    key: "wolf_3",
    img: "Characters/card_char6_wolf.png",
    name: "The Wolf",
    desc: "A mysterious and formidable figure, The Wolf is both feared and respected. His presence always signals a challenge."
  }
];

export default class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: "EndScene" });
    this.currentChar = 0;
    this.isWin = false;
  }

  init(data) {
    // data.isWin: true if player matched all pairs, false otherwise
    this.isWin = data && data.isWin;
  }

  preload() {
    this.load.image("bg1", "public/assets/bg_1.jpg");
    this.load.image("logo", "public/assets/logo.png");
    this.load.image("arrow_left", "public/assets/arrow_left.png");
    this.load.image("arrow_right", "public/assets/arrow_right.png");
    this.load.image("btn_playagain", "public/assets/btn_playagain.png");
    this.load.image("btn_discovermore", "public/assets/btn_discover more.png");
    CHARACTERS.forEach(c => this.load.image(c.key, `public/assets/${c.img}`));
    // No need to preload video, will use DOM element
  }

  create() {
    // Background and logo
    this.add.image(400, 600, "bg1").setDisplaySize(800, 1200);
    this.add.image(400, 100, "logo").setScale(0.5);

    // Result text
    this.resultText = this.add.text(400, 210,
      this.isWin
        ? "Congratulations!\nYou've matched all the pairs"
        : "Try again!\nYou haven't matched all the pairs",
      {
        fontFamily: "Arial",
        fontSize: "40px",
        fontStyle: "bold",
        color: "#ffe600",
        align: "center",
        stroke: "#000",
        strokeThickness: 8,
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 4, fill: true },
        wordWrap: { width: 700 }
      }
    ).setOrigin(0.5, 0.5);

    // Video frame (gold border)
    this.add.rectangle(400, 350, 520, 300)
      .setStrokeStyle(4, 0xffe600)
      .setFillStyle(0x000000, 0)
      .setDepth(2);

    // Video DOM element (centered, always in frame)
    this.createVideo();

    // Character carousel
    this.createCarousel();

    // Buttons
    this.createButtons();
  }

  createVideo() {
    // Centered video, always in frame
    this.video = this.add.dom(400, 350).createFromHTML(`
      <video id="pib-video" width="500" height="280" style="display:block;margin:0 auto;border-radius:0px;background:#000;outline:none;border:none;" controls autoplay>
        <source src="public/assets/video/tvc_video_pussinboots.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `).setOrigin(0.5, 0.5);;

    this.time.delayedCall(200, () => {
      const video = document.getElementById("pib-video");
      if (video) {
        video.volume = 1;
        video.muted = false;
        video.play();
      }
    });
  }

  createCarousel() {
    // Card background (parchment style)
    this.cardBg = this.add.rectangle(400, 670, 600, 220, 0xfbeec1, 1)
      .setStrokeStyle(2, 0xd4a017)
      .setDepth(2);

    // Character image (large, left, inside card)
    this.charImg = this.add.image(150, 670, CHARACTERS[0].key).setScale(1.05).setDepth(3).setOrigin(0.5, 0.5);

    // // Character name (large, bold, right of image, top)
    // this.charName = this.add.text(250, 590, CHARACTERS[0].name, {
    //   fontFamily: "Arial",
    //   fontSize: "32px",
    //   fontStyle: "bold",
    //   color: "#000",
    //   wordWrap: { width: 320 }
    // }).setOrigin(0.5, 0.5).setDepth(3);

    // // Character desc (right of image, below name)
    // this.charDesc = this.add.text(250, 640, CHARACTERS[0].desc, {
    //   fontFamily: "Arial",
    //   fontSize: "22px",
    //   color: "#000",
    //   wordWrap: { width: 320 }
    // }).setOrigin(0, 0).setDepth(3);

    // Arrows (vertically centered, outside card edge)
    this.arrowLeft = this.add.image(60, 670, "arrow_left").setInteractive().setScale(1.5).setDepth(4);
    this.arrowRight = this.add.image(740, 670, "arrow_right").setInteractive().setScale(1.5).setDepth(4);

    this.arrowLeft.on("pointerdown", () => this.switchChar(-1));
    this.arrowRight.on("pointerdown", () => this.switchChar(1));
  }

  switchChar(dir) {
    this.currentChar = (this.currentChar + dir + CHARACTERS.length) % CHARACTERS.length;
    const c = CHARACTERS[this.currentChar];
    this.charImg.setTexture(c.key);
    this.charName.setText(c.name);
    this.charDesc.setText(c.desc);
  }

  createButtons() {
    // Play Again
    this.playAgainBtn = this.add.image(250, 900, "btn_playagain").setInteractive().setScale(1.2);
    this.playAgainBtn.on("pointerdown", () => {
      this.scene.start("MemoryCardScene");
    });

    // Discover More
    this.discoverMoreBtn = this.add.image(550, 900, "btn_discovermore").setInteractive().setScale(1.2);
    // No action needed for discover more
  }
}
import Phaser from "phaser";

const CHARACTERS = [
  {
    key: "puss",
    img: "Characters/card_char1_puss.png",
    name: "Puss In Boots",
    desc: "A hero to some, an outlaw to others...everyone agrees that this swashbuckling cat has style to spare. Known for his iconic boots, Puss is a skilled swordsman, charming, fearless, determined and a crazy-good dancer."
  },
  {
    key: "kitty",
    img: "Characters/card_char2_kitty.png",
    name: "Kitty Softpaws",
    desc: "A street-smart, quick-witted cat with a mysterious past. Kitty is agile, clever, and always ready for adventure."
  },
  {
    key: "perro",
    img: "Characters/card_char3_perro.png",
    name: "Perro",
    desc: "A loyal and energetic dog who brings joy and laughter to every adventure. Perro is always eager to help his friends."
  },
  {
    key: "goldilocks",
    img: "Characters/card_char4_goldilocks.png",
    name: "Goldilocks",
    desc: "A tough and resourceful girl with a heart of gold. Goldilocks leads her bear family with courage and love."
  },
  {
    key: "bear",
    img: "Characters/card_char5_bear.png",
    name: "Papa Bear",
    desc: "Strong and protective, Papa Bear is always there for his family. He may look fierce, but he has a soft spot for his loved ones."
  },
  {
    key: "wolf",
    img: "Characters/card_char6_wolf.png",
    name: "The Wolf",
    desc: "Mysterious and cunning, The Wolf is a formidable presence. His sharp senses and quick reflexes make him a challenging foe."
  }
];

export default class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: "EndScene" });
    this.currentIndex = 0;
    this.isMuted = false;
    this.isAllMatched = true; // Set this from previous scene!
  }

  preload() {
    this.load.image("logo", "public/assets/logo.png");
    this.load.image("arrow_left", "public/assets/arrow_left.png");
    this.load.image("arrow_right", "public/assets/arrow_right.png");
    this.load.image("btn_playagain", "public/assets/btn_playagain.png");
    this.load.image("btn_discovermore", "public/assets/btn_discover more.png");
    CHARACTERS.forEach(c => this.load.image(c.key, `public/assets/${c.img}`));
  }

  create(data) {
    // Get result from previous scene
    this.isAllMatched = data?.allMatched ?? true;

    // Background
    this.cameras.main.setBackgroundColor("#a00000");

    // Logo
    this.add.image(400, 80, "logo").setScale(0.5);

    // Result text
    this.resultText = this.add.text(400, 200,
      this.isAllMatched
        ? "Congratulations!\nYou've matched all the pairs."
        : "Try again!\nYou haven't matched all the pairs.",
      {
        font: "bold 44px Arial",
        color: "#ffe066",
        align: "center",
        stroke: "#000",
        strokeThickness: 6
      }
    ).setOrigin(0.5);

    // Video (using DOM element)
    this.createVideo();

    // Carousel
    this.createCarousel();

    // Buttons
    this.createButtons();
  }

  createVideo() {
    // Phaser 3 video element (for mp4)
    this.video = this.add.dom(400, 370).createFromHTML(`
      <div style="position:relative;width:480px;height:270px;">
        <video id="puss-video" width="480" height="270" style="border:4px solid #ffcc66; border-radius:8px; background:#000;" autoplay>
          <source src="public/assets/video/tvc_video_pussinboots.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <button id="mute-btn" style="position:absolute;top:10px;right:10px;z-index:2;background:rgba(0,0,0,0.5);border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;">
          <span id="mute-icon" style="font-size:22px;color:#fff;">🔊</span>
        </button>
      </div>
    `);

    // Mute/unmute logic
    this.time.delayedCall(100, () => {
      const video = document.getElementById("puss-video");
      const muteBtn = document.getElementById("mute-btn");
      const muteIcon = document.getElementById("mute-icon");
      if (video && muteBtn && muteIcon) {
        video.muted = false;
        muteBtn.onclick = () => {
          video.muted = !video.muted;
          muteIcon.textContent = video.muted ? "🔇" : "🔊";
        };
        // Replay after end
        video.onended = () => {
          video.currentTime = 0;
          video.pause();
          // Show replay icon overlay
          muteIcon.textContent = "⟳";
          muteBtn.onclick = () => {
            video.play();
            muteIcon.textContent = video.muted ? "🔇" : "🔊";
          };
        };
      }
    });
  }

  createCarousel() {
    // Card background
    this.cardBg = this.add.rectangle(400, 650, 600, 200, 0xffe066, 1)
      .setStrokeStyle(4, 0xffcc66)
      .setOrigin(0.5);

    // Character image
    this.charImg = this.add.image(220, 650, CHARACTERS[0].key).setScale(0.7);

    // Name
    this.charName = this.add.text(320, 570, CHARACTERS[0].name, {
      font: "bold 32px Arial",
      color: "#000"
    }).setOrigin(0, 0.5);

    // Description
    this.charDesc = this.add.text(320, 650, CHARACTERS[0].desc, {
      font: "22px Arial",
      color: "#222",
      wordWrap: { width: 340 }
    }).setOrigin(0, 0.5);

    // Arrows
    this.leftArrow = this.add.image(100, 650, "arrow_left").setInteractive().setScale(1.2);
    this.rightArrow = this.add.image(700, 650, "arrow_right").setInteractive().setScale(1.2);

    this.leftArrow.on("pointerdown", () => this.showCharacter(this.currentIndex - 1));
    this.rightArrow.on("pointerdown", () => this.showCharacter(this.currentIndex + 1));
  }

  showCharacter(idx) {
    if (idx < 0) idx = CHARACTERS.length - 1;
    if (idx >= CHARACTERS.length) idx = 0;
    this.currentIndex = idx;
    const c = CHARACTERS[idx];
    this.charImg.setTexture(c.key);
    this.charName.setText(c.name);
    this.charDesc.setText(c.desc);
  }

  createButtons() {
    // Play Again
    this.playAgainBtn = this.add.image(250, 850, "btn_playagain").setInteractive().setScale(1.1);
    this.playAgainBtn.on("pointerdown", () => {
      // Remove video element
      const video = document.getElementById("puss-video");
      if (video) video.pause();
      this.scene.start("MemoryCardScene");
    });

    // Discover More
    this.discoverBtn = this.add.image(550, 850, "btn_discovermore").setInteractive().setScale(1.1);
    this.discoverBtn.on("pointerdown", () => {
      // Dummy action
    });
  }
}

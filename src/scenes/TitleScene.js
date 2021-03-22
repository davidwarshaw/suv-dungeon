import properties from "../properties";

import Font from "../ui/Font";
import Menu from "../ui/Menu";

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: "TitleScene" });
  }

  init() {
    this.playState = {
      level: 0,
      cash: 0,
      skulls: 0,
      gameCrystals: 0,
      health: 0,
      speed: 0,
      music: {},
      sfx: {},
    };

    this.playState.sfx = {
      horn: this.sound.add("horn"),
      engine: this.sound.add("engine"),
      stomp: this.sound.add("stomp"),
      coin: this.sound.add("coin"),
    };

    this.playState.music = {
      menu: this.sound.add("music-menu"),
      game: this.sound.add("music-game"),
    };
  }

  create() {
    this.font = new Font(this);

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;
    const top = 80;

    this.title = this.add.image(centerX, centerY, "title-big");

    this.menu = new Menu(
      this,
      [
        {
          text: "let's go!",
          cb: () => {
            this.scene.start("GameScene", this.playState);
          },
        },
      ],
      centerX,
      top + 80
    );

    this.playState.music.menu.play({ loop: true, volume: 0.5 });
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
  }
}
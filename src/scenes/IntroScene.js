import properties from "../properties";

import Async from "../utils/Async";

import SpriteStack from "../sprites/SpriteStack";

import CharactersSpeech from "../ui/CharactersSpeech";

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: "IntroScene" });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    const centerX = properties.width / 2;
    const centerY = properties.height / 2;
    this.background = this.add.image(centerX, centerY, "splash-castle");

    this.suv = new SpriteStack(this, centerX, properties.height, "sprite-stack-player");
    this.suv.rotation = 1.5 * Math.PI;

    this.introOver = this.introOver.bind(this);
    this.characterSpeech = new CharactersSpeech(this, "intro", this.introOver);

    // this.playState.music.menu.play({ loop: true, volume: 0.5 });

    Async.tween(this, {
      targets: this.suv,
      y: centerY + 70,
      duration: properties.speechWaitMillis,
    }).then(() => {
      this.startSpeechTimer = this.time.delayedCall(properties.speechWaitMillis, () =>
        this.characterSpeech.showNextSpeech()
      );
    });
  }

  introOver() {
    this.scene.start("GameScene", this.playState);
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
  }
}

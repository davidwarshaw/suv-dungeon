import properties from '../properties';

import Font from '../ui/Font';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    this.playState = {
      level: 1,
      maxLevels: 10,
    };

    this.font = new Font(this);

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;

    this.images = [];

    this.images.push(this.add.image(centerX, centerY, 'title-big'));

    const offsetY = 70;
    const text = 'press any key or button';
    const offsetX = this.offsetForText(text);
    this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, text));

    this.input.keyboard.on('keydown', () => this.keyDown());
    this.buttonIsPressed = false;
    this.gamePadListeners = false;
    
    this.sounds = {
      newGame: this.sound.add('new-game'),
    }
  }

  update() {
    if (!this.gamePadListeners && this.input.gamepad && this.input.gamepad.pad1) {
      this.input.gamepad.pad1.on('down', () => {
        if (!this.buttonIsPressed) {
          this.keyDown();
        }
      });
      this.input.gamepad.pad1.on('up', () => this.buttonIsPressed = false);
      this.gamePadListeners = true;
    }
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
  }

  keyDown() {
    this.sounds.newGame.play();
    this.input.gamepad.removeAllListeners();
    this.scene.start('LevelTitleScene', this.playState);
  }

}

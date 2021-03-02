import properties from '../properties';

import Font from '../ui/Font';

export default class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WinScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    this.font = new Font(this);

    const text = ['dance, flirt, and make away', 'nights end is pale embrace', 'but not to-day'];

    this.images = [];

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;

    this.images.push(this.add.image(centerX, centerY, 'cathedral'));

    text.forEach((textLine, row) => {
      let offsetX = this.offsetForText(textLine);
      let offsetY = -94 + (16 * row);
      this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, textLine));  
    });
    this.input.keyboard.on('keydown', () => this.keyDown());
    this.buttonIsPressed = false;
    this.gamePadListeners = false;

    this.sounds = {
      enter: this.sound.add('enter'),
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
    const offset = - ((text.length * 8) / 2);
    return offset;
  }

  keyDown() {
    this.sounds.enter.play();
    this.input.gamepad.removeAllListeners();
    this.scene.start('TitleScene', this.playState);
  }
}

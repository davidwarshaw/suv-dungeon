import properties from '../properties';

import Font from '../ui/Font';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    this.font = new Font(this);

    this.messages = [
      ['so goeth the way', 'of all flesh'],
      ['thus passes', 'worldly glory'],
      ['all is vanity'],
      ['all those proud', 'shall be brought low'],
      ['all are of dirt', 'to dirt', 'shall all return'],
      ['a regal meal', 'for maggots', 'a fatted king maketh'],
    ];

    this.images = [];

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;

    this.images.push(this.add.image(centerX, centerY, 'crown'));

    let text = properties.rng.getItem(this.messages);
    text.forEach((textLine, row) => {
      let offsetX = this.offsetForText(textLine);
      let offsetY = -32 + (16 * row);
      this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, textLine));  
    });

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
    const offset = - ((text.length * 8) / 2) - 80;
    return offset;
  }

  keyDown() {
    this.sounds.newGame.play();
    this.input.gamepad.removeAllListeners();
    this.scene.start('LevelTitleScene', this.playState);
  }

}

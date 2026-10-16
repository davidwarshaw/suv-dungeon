import properties from '../properties';

import Font from '../ui/Font';

import SpriteStack from '../sprites/SpriteStack';

export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CreditsScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    this.font = new Font(this);

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;

    const offsetY = 40;
    const lineSpacing = 14;

    let line;
    this.credits = [];
    line = 'art and code';
    this.credits.push(this.font.render(centerX + this.offsetForText(line), centerY - offsetY - 2 * lineSpacing, line));
    line = '_never_k';
    this.credits.push(this.font.render(centerX + this.offsetForText(line), centerY - offsetY - lineSpacing, line));

    this.suv = new SpriteStack(this, centerX, centerY, 'sprite-stack-player');

    line = 'music and sound';
    this.credits.push(this.font.render(centerX + this.offsetForText(line), centerY + offsetY, line));
    line = 'bruno almeida';
    this.credits.push(this.font.render(centerX + this.offsetForText(line), centerY + offsetY + lineSpacing, line));
  }

  update(time, delta) {
    this.suv.rotation += 0.004 * delta;
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
  }
}

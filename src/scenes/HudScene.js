import properties from '../properties';

import Font from '../ui/Font';

export default class HudScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HudScene' });
  }

  create() {
    this.font = new Font(this);
    this.background = this.add.image(0, 0, 'hud-bg');
    this.background.setOrigin(0, 0);

    this.needle = this.add.image(40, 40, 'needle');
    this.needle.setOrigin(0.5, 1);
    this.needle.rotation = this.needleRotationForSpeed(0);

    this.needleSmall = this.add.image(this.needleXForHealthPercent(1), 90, 'needle-small');

    this.warn = this.add.image(40, 20, 'warn');
    this.warn.setVisible(false);

    const transmission = "P";
    this.transmissionText = this.font.render(36, 61, transmission);

    const baseY = 114;
    const yIncrement = 24;
    
    let iconY = baseY;
    this.roomText = this.font.render(20, iconY - 2, 'room 1');
    
    iconY = baseY + yIncrement;
    this.crystalIcon = this.add.image(17, iconY, 'crystal');
    this.crystalText = this.font.render(31, iconY - 2, this.textForCrystals(0, 0));
    
    iconY = baseY + 2 * yIncrement;
    this.cashIcon = this.add.image(17, iconY, 'cash');
    this.cashText = this.font.render(31, iconY - 2, '0');
    
    iconY = baseY + 3 * yIncrement;
    this.skullIcon = this.add.image(17, iconY, 'skull');
    this.skullText = this.font.render(31, iconY - 2, '0');
    

    const gameScene = this.scene.get('GameScene');
    gameScene.events.on(
      'update-hud',
      payload => {
        const { speed, transmission, healthPercent, crystals, cash, skulls, warn, room } = payload;
        this.tweens.add({
          targets: this.needle,
          rotation: this.needleRotationForSpeed(speed),
          duration: properties.turnDurationMillis
        });
        this.transmissionText.setText(transmission);
        this.tweens.add({
          targets: this.needleSmall,
          x: this.needleXForHealthPercent(healthPercent),
          duration: properties.turnDurationMillis
        });
        this.crystalText.setText(this.textForCrystals(crystals.left, crystals.total));
        this.cashText.setText(cash);
        this.skullText.setText(skulls);
        this.warn.setVisible(warn);
        this.roomText.setText(`ROOM ${room}`);
      },
      this
    );
  }

  needleRotationForSpeed(speed) {
    const rotation = -(7 / 8) * Math.PI + (speed * (Math.PI / 4));
    return rotation;
  }

  needleXForHealthPercent(healthPercent) {
    const left = 10;
    const right = properties.hudWidth - 10;
    return (healthPercent * (right - left)) + left;
  }

  textForCrystals(left, total) {
    return `${left} / ${total}`;
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
  }
}

import properties from '../properties';

import Font from '../ui/Font';

export default class HudScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HudScene' });
  }

  create() {
    this.font = new Font(this);

    this.barLength = 10;
    this.xPadding = 20;

    this.pestilenceBar = this.createPestilenceBar();
    this.infectionBar = this.createInfectionBar();

    this.bodiesLeft = this.font.render(8, 6, '0-0');

    const gameScene = this.scene.get('GameScene');
    gameScene.events.on(
      'update-meters',
      meters => {
        const pestilenceBars = Math.floor((meters.pestilence / 100) * this.barLength);
        const infectionBars = Math.floor((meters.infection / 100) * this.barLength);

        //console.log(`pestilenceBars: ${pestilenceBars} infectionBars: ${infectionBars}`);

        this.pestilenceBar.forEach((level, i) => {
          const frame = i < pestilenceBars ? 0 : 1;
          level.setFrame(frame);
        });
        this.infectionBar.forEach((level, i) => {
          const frame = i < infectionBars ? 0 : 1;
          level.setFrame(frame);
        });
      },
      this
    );
    gameScene.events.on(
      'bodies-left',
      payload => {
        const {night, bodiesLeft} = payload;
        this.bodiesLeft.setText(`${night}-${bodiesLeft}`);
      },
      this
    );
    gameScene.events.on(
      'show-win',
      () => {
        if (!this.pestilenceBar || !this.infectionBar) {
          return;
        }
        this.pestilenceBar.forEach(image => image.destroy());
        this.pestilenceBar = null;
        this.infectionBar.forEach(image => image.destroy());
        this.infectionBar = null;
    
        const centerX = properties.width / 2; 
        const y = 10;
        const message = 'pestilence has been contained';
        this.message = this.font.render(centerX + this.offsetForText(message), y, message);
      },
      this);
    gameScene.events.on(
      'show-loss',
      bar => {
        if (!this.pestilenceBar || !this.infectionBar) {
          return;
        }
        this.pestilenceBar.forEach(image => image.destroy());
        this.pestilenceBar = null;
        this.infectionBar.forEach(image => image.destroy());
        this.infectionBar = null;
    
        const centerX = properties.width / 2; 
        const y = 10;
        const message = `${bar} breaks out`;
        this.message = this.font.render(centerX + this.offsetForText(message), y, message);
      },
      this);
  }

  createPestilenceBar() {
    const centerX = properties.width / 2;
    const xLeft = centerX - ((this.barLength * this.xPadding) / 2) + 8;
    const y = 10;
    return [...Array(this.barLength).keys()].map(i =>
      this.add.image(xLeft + i * this.xPadding, y, 'rat', 1)
    );
  }

  createInfectionBar() {
    const centerX = properties.width / 2;
    const xLeft = centerX - ((this.barLength * this.xPadding) / 2) + 8;
    const y = 28;
    return [...Array(this.barLength).keys()].map(i =>
      this.add.image(xLeft + i * this.xPadding, y, 'skull', 1)
    );
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
  }
}

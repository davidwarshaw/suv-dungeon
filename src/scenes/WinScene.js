import properties from '../properties';

import Font from "../ui/Font";
import Menu from "../ui/Menu";

export default class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WinScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    this.font = new Font(this);

    // this.playState.music = {
    //   menu: this.sound.add("music-menu"),
    //   flight: this.sound.add("music-flight"),
    // };

    const { gameCrystals, cash, skulls } = this.playState;

    const baseX = 150;
    const xOffset = 20;
    const baseY = 50;
    const yIncrement = 30;
    
    let iconY = baseY;
    this.message = this.font.render(properties.width / 2 - 30, iconY - 12, 'you win!');

    iconY = baseY + yIncrement;
    this.crystalIcon = this.add.image(baseX, iconY, 'crystal');
    this.crystalText = this.font.render(baseX + xOffset, iconY - 2, String(gameCrystals));
    
    iconY = baseY + 2 * yIncrement;
    this.cashIcon = this.add.image(baseX, iconY, 'cash');
    this.cashText = this.font.render(baseX + xOffset, iconY - 2, String(cash));
    
    iconY = baseY + 3 * yIncrement;
    this.skullIcon = this.add.image(baseX, iconY, 'skull');
    this.skullText = this.font.render(baseX + xOffset, iconY - 2, String(skulls));
    
    this.menu = new Menu(
      this,
      [
        {
          text: "try again",
          cb: () => {
            this.scene.start("TitleScene", this.playState);
          },
        },
      ],
      properties.width / 2,
      iconY + 32
    );

    this.playState.music.menu.stop();
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
  }
}
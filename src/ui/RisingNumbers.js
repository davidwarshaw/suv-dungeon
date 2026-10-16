import properties from '../properties';

import Font from './Font';

export default class RisingNumbers {
  constructor(scene, origin, number, color, height, fixed) {
    const font = new Font(scene);

    const yOffset = -height || 0;

    const numberString = number.toString();
    const xOffset = number < 0 ? -16 : -8;
    const text = font.render(origin.x + xOffset, origin.y + yOffset, numberString);
    // Z order all the way to the front
    text.setDepth(properties.mapHeightTiles + 1);
    if (fixed) {
      text.setScrollFactor(0);
    }

    switch(color) {
      case "red": {
        text.tint = 0xb13e53;
        break;
      }
      default: {
        text.tint = 0xf4f4f4;
        break;
      }
    }

    scene.tweens.add({
      targets: text,
      alpha: 0,
      duration: properties.numberMillis
    });
    scene.tweens.add({
      targets: text,
      x: origin.x + xOffset,
      y: origin.y - 60,
      duration: properties.numberMillis,
      onComplete: () => {
        text.destroy();
      },
      onCompleteScope: this
    });
  }
}
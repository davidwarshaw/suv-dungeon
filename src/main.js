import "phaser";

import properties from "./properties";

import BootScene from "./scenes/BootScene";
import GameScene from "./scenes/GameScene";

const config = {
  type: Phaser.WEBGL,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: properties.width,
    height: properties.height,
    zoom: properties.scale,
  },
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 } },
  },
  input: {
    gamepad: true,
  },
  scene: [BootScene, GameScene],
};

const game = new Phaser.Game(config); // eslint-disable-line no-unused-vars

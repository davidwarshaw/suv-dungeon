import "phaser";

import { NinePatchPlugin } from "@koreez/phaser3-ninepatch";

import properties from "./properties";

import BootScene from "./scenes/BootScene";
import TitleScene from "./scenes/TitleScene";
import IntroScene from "./scenes/IntroScene";
import GameScene from "./scenes/GameScene";
import HudScene from "./scenes/HudScene";
import GameOverScene from "./scenes/GameOverScene";
import WinScene from "./scenes/WinScene";
import CreditsScene from "./scenes/CreditsScene";

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
  scene: [
    BootScene,
    TitleScene,
    IntroScene,
    GameScene,
    HudScene,
    GameOverScene,
    WinScene,
    CreditsScene,
  ],
  plugins: {
    global: [{ key: "NinePatchPlugin", plugin: NinePatchPlugin, start: true }],
  },
};

const game = new Phaser.Game(config); // eslint-disable-line no-unused-vars

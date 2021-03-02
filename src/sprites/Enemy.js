import Character from './Character';

import Fov from './Fov';

export default class Enemy extends Character {
  constructor(scene, map, tile, type) {
    super(scene, map, tile, `enemy-${type}`);

    this.aiMode = 'WATCH';

    this.waitTurns = 0;
  }

  setWait(turns) {
    this.waitTurns = turns;
  }

  popWait() {
    const wait = this.waitTurns;
    this.waitTurns = Phaser.Math.Clamp(this.waitTurns - 1, 0, 100);
    return wait > 0;
  }

  recalculateFov() {
    const tilePosition = this.getTilePosition();
    const facing = this.direction;
    this.fov.recalculate(tilePosition, facing);
  }
}
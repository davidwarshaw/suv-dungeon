import Character from './Character';

import enemiesDefinition from '../definitions/enemiesDefinition';

import Fov from './Fov';

export default class Enemy extends Character {
  constructor(scene, map, tile, type, enemyId) {
    super(scene, map, tile, `enemy-${type}`);

    this.enemyId = enemyId;

    this.definition = enemiesDefinition[type];
    this.waitTurns = 0;

    this.alive = true;
    this.health = this.definition.maxHealth;

    this.aiMode = "IDLE";
    this.path = [];
  }

  peakPath() {
    if (this.path.length > 0) {
      return this.path[0];
    }
    return null;
  }

  popPath() {
    if (this.path.length > 0) {
      return this.path.shift();
    }
    return null;
  }

  recalculateFov() {
    const tilePosition = this.getTilePosition();
    const facing = this.direction;
    this.fov.recalculate(tilePosition, facing);
  }
}

import mapDefinition from '../definitions/mapDefinition';

import Enemy from '../sprites/Enemy';

export default class Enemies {
  constructor(scene, map, level) {
    this.scene = scene;
    this.map = map;

    this.mapDefinition = mapDefinition[map.currentMap];
    this.density = 0.10;

    this.list = [];
  }

  add(tile, enemyType) {
    this.list.push(new Enemy(this.scene, this.map, tile, enemyType));
  }

  someAtTilePosition(tilePosition) {
    return this.list.some((enemy) => enemy.isAtTilePosition(tilePosition));
  }

  getFov() {
    const fov = {};
    this.list.forEach((enemy) => {
      Object.assign(fov, enemy.fov.field);
    });
    return fov;
  }
}
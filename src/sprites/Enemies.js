import properties from "../properties";

import enemiesDefinition from "../definitions/enemiesDefinition";
import mapDefinition from "../definitions/mapDefinition";
import levelDefinition from "../definitions/levelDefinition";

import Enemy from "../sprites/Enemy";
import Projectile from "./Projectile";

export default class Enemies {
  constructor(scene, map, player, level) {
    this.scene = scene;
    this.map = map;
    this.player = player;
    this.level = level;

    this.mapDefinition = mapDefinition[map.currentMap];
    this.density = 0.03 * level;
    this.enemyType = "wizard";

    this.nextId = 0;
    this.list = [];
    this.listProjectiles = [];

    this.populate();
  }

  populate() {
    const passableTiles = this.map.getPassableTiles();
    // console.log(passableTiles);
    // console.log(`passableTiles.length: ${passableTiles.length}`);
    const numEnemies = Math.round(passableTiles.length * this.density);
    // console.log(`numEnemies: ${numEnemies}`);
    const enemyTiles = passableTiles
      .filter((tile) => !this.player.isAtTilePosition(tile))
      .map((tile) => ({ x: tile.x, y: tile.y, randomOrder: properties.rng.getUniform() }))
      .sort((l, r) => l.randomOrder - r.randomOrder)
      .slice(0, numEnemies);

    for (let enemyTile of enemyTiles) {
      this.add(enemyTile, this.enemyType);
    }
  }

  add(tile, enemyType) {
    const { missile } = enemiesDefinition[enemyType];
    const newEnemy = new Enemy(this.scene, this.map, tile, enemyType, this.nextId);
    if (missile) {
      newEnemy.projectile = new Projectile(this.scene, this.map, missile, newEnemy);
    }
    this.list.push(newEnemy);
    this.nextId++;
  }

  removeById(enemyId) {
    const index = this.list.findIndex((enemy) => enemy.enemyId === enemyId);
    this.list.splice(index, 1);
  }

  noneAtTilePosition(tilePosition) {
    return !this.someAtTilePosition(tilePosition);
  }

  someAtTilePosition(tilePosition) {
    return this.list.some((enemy) => enemy.isAtTilePosition(tilePosition));
  }

  getAtTilePosition(tilePosition) {
    const enemies = this.list.filter((enemy) => enemy.isAtTilePosition(tilePosition));
    return enemies[0];
  }

  getFov() {
    const fov = {};
    this.list.forEach((enemy) => {
      Object.assign(fov, enemy.fov.field);
    });
    return fov;
  }

  getTilePositions() {
    return this.list.map((enemy) => enemy.getTilePosition());
  }
}

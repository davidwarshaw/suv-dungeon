import properties from "../properties";

import enemiesDefinition from "../definitions/enemiesDefinition";
import mapDefinition from "../definitions/mapDefinition";
import levelsDefinition from "../definitions/levelsDefinition";

import Enemy from "../sprites/Enemy";
import Projectile from "./Projectile";

export default class Enemies {
  constructor(scene, map, player, level) {
    this.scene = scene;
    this.map = map;
    this.player = player;
    this.level = level;

    this.mapDefinition = mapDefinition[map.currentMap];
    this.levelDefinition = levelsDefinition[level];
    // this.density = 0.03 * level;
    this.density = 0.1 * level;

    this.nextId = 0;
    this.list = [];
    this.nextProjectileId = 0;
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
      const enemyType = properties.rng.getWeightedValue(this.levelDefinition.enemies);
      this.add(enemyTile, enemyType);
    }
  }

  add(tile, enemyType) {
    const newEnemy = new Enemy(this.scene, this.map, tile, enemyType, this.nextId);

    this.list.push(newEnemy);
    this.nextId++;
  }

  addProjectile(enemy, missilePath) {
    const { missile } = enemy.definition;
    if (!missile) {
      return;
    }
    const newProjectile = new Projectile(
      this.scene,
      this.map,
      missile,
      missilePath,
      enemy,
      this.nextProjectileId
    );
    this.listProjectiles.push(newProjectile);
    this.nextProjectileId++;

    enemy.activeProjectile = true;

    return newProjectile;
  }

  removeById(enemyId) {
    const index = this.list.findIndex((enemy) => enemy.enemyId === enemyId);
    if (index === -1) {
      console.log(`Enemy id: ${enemyId} is already removed`);
      return;
    }
    this.list.splice(index, 1);
  }

  removeProjectileById(projectileId) {
    // console.log(`Removing projectile id: ${projectileId}`);
    const index = this.listProjectiles.findIndex(
      (projectile) => projectile.projectileId === projectileId
    );
    // console.log(`projectile index: ${index}`);
    if (index === -1) {
      console.log(`Projectile id: ${projectileId} is already removed`);
      return;
    }
    this.listProjectiles.splice(index, 1);
  }

  noneAtTilePosition(tilePosition) {
    return !this.someAtTilePosition(tilePosition);
  }

  someAtTilePosition(tilePosition) {
    return this.list.some((enemy) => enemy.isAtTilePosition(tilePosition));
  }

  noProjectileAtTilePosition(tilePosition) {
    return !this.someProjectileAtTilePosition(tilePosition);
  }

  someProjectileAtTilePosition(tilePosition) {
    return this.listProjectiles.some((projectile) => projectile.isAtTilePosition(tilePosition));
  }

  getAtTilePosition(tilePosition) {
    const enemies = this.list.filter((enemy) => enemy.isAtTilePosition(tilePosition));
    return enemies[0];
  }

  getProjectileAtTilePosition(tilePosition) {
    const projectiles = this.listProjectiles.filter((projectile) =>
      projectile.isAtTilePosition(tilePosition)
    );
    return projectiles[0];
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

  enemyHasProjectile(enemy) {
    const ownedProjectiles = this.listProjectiles
      .filter((projectile) => projectile.isActive)
      .filter((projectile) => projectile.owner.id === enemy.id);
    // console.log("enemyHasProjectile:");
    // console.log("this.listProjectiles:");
    // console.log(this.listProjectiles);
    return ownedProjectiles.length > 0;
  }
}

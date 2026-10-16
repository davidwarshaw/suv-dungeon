import properties from "../properties";

import TileMath from '../utils/TileMath';

import SpriteStack from "./SpriteStack";

export default class Player extends SpriteStack {
  constructor(scene, map, tile) {
    super(scene, 0, 0, 'sprite-stack-player');
    this.map = map;
    this.moveQueue = [];

    this.characterType = "player";

    const world = TileMath.addHalfTile(map.tilemap.tileToWorldXY(tile.x, tile.y));
    this.x = world.x;
    this.y = world.y;

    this.isAnimated = false;

    this.isAlive = true;

    this.maxSpeed = 10;
    this.topSpeed = {
      forward: 4,
      reverse: -2
    };
    this.speed = this.scene.playState.speed >= 0 ? this.scene.playState.speed : 0;
    this.maxHealth = 50;
    this.health = this.scene.playState.health > 0 ?
      this.scene.playState.health :
      this.maxHealth;
    
    this.direction = 'up';
    this.damageSpeedFactor = 10;

    this.warn = false;
  }

  accelerate(acceleration) {
    this.speed = Phaser.Math.Clamp(this.speed + acceleration, this.topSpeed.reverse, this.topSpeed.forward);
  }

  getTransmission() {
    if (this.speed < 0) {
      return "R";
    } else if (this.speed > 0) {
      return "D";
    }
    return "N";
  }

  getHealthPercent() {
    return this.health / this.maxHealth;
  }

  getTilePosition() {
    return this.map.tilemap.worldToTileXY(this.x, this.y);
  }

  isAtTilePosition(tilePosition) {
    const characterTilePosition = this.getTilePosition();
    return characterTilePosition.x === tilePosition.x && characterTilePosition.y === tilePosition.y;
  }

  setNextTurn(nextTurn) {
    this.nextTurn = nextTurn;
  }

  popNextTurn() {
    const nextTurn = this.nextTurn
    this.nextTurn = null;
    return nextTurn;
  }

  peekNextTurn() {
    return this.nextTurn;
  }

  setZFromY() {
    const { y } = this.getTilePosition();
    this.images.forEach((image, i) => {
      image.setDepth(y);
    });
  }
}
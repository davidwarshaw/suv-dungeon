
import SpriteStack from "./SpriteStack";

export default class Player extends SpriteStack {
  constructor(scene, map, tile) {
    super(scene, map, tile, 'sprite-stack-player');
    this.moveQueue = [];

    this.characterType = "player";
    this.isAnimated = false;

    this.isAlive = true;

    this.maxSpeed = 10;
    this.topSpeed = {
      forward: 4,
      reverse: -2
    };
    this.speed = this.scene.playState.speed;
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
}
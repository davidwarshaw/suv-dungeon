
import SpriteStack from "./SpriteStack";

export default class Player extends SpriteStack {
  constructor(scene, map, tile, key) {
    super(scene, map, tile, 'sprite-stack-player');
    this.moveQueue = [];

    this.topSpeed = {
      foward: 4,
      reverse: -2
    };
    this.speed = 0;
    this.direction = 'down';
  }

  accelerate(acceleration) {
    this.speed = Phaser.Math.Clamp(this.speed + acceleration, this.topSpeed.reverse, this.topSpeed.foward);
  }
}
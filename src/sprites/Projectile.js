import properties from "../properties";

import projectilesDefinition from "../definitions/projectilesDefinition.json";

import TileMath from "../utils/TileMath";

export default class Projectile extends Phaser.GameObjects.Sprite {
  constructor(scene, map, projectileType, path, owner, projectileId) {
    const spritesheet = `projectile-${projectileType}`;
    super(scene, 0, 0, spritesheet);
    this.scene = scene;
    this.map = map;
    this.projectileType = projectileType;
    this.path = path;
    this.owner = owner;
    this.projectileId = projectileId;

    console.log(`projectileId: ${projectileId}`);
    path.forEach((position) => {
      console.log(`${position.x}, ${position.y}`);
    });

    scene.add.existing(this);

    this.definition = projectilesDefinition[projectileType];

    this.maxSpeed = 10;
    this.speed = this.definition.speed;

    this.isAnimated = true;

    this.isActive = false;

    const rotation = Phaser.Math.Angle.BetweenPoints(path[0], path[path.length - 1]);
    this.setPosition(0, 0);
    this.setRotation(rotation);
    this.setZFromY();
    this.visible = false;

    scene.anims.create({
      key: `${projectileType}_move`,
      frames: scene.anims.generateFrameNumbers(spritesheet, { start: 0, end: 1 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: `${projectileType}_die`,
      frames: scene.anims.generateFrameNumbers(spritesheet, { start: 2, end: 3 }),
      frameRate: properties.animFrameRate,
      repeat: 0,
    });
  }

  peakPath() {
    const path = this.path.slice(0, this.definition.speed + 1);
    if (path.length > 0) {
      return path;
    }
    return null;
  }

  popPath() {
    // console.log("original path");
    // this.path.forEach((position) => {
    //   console.log(`${position.x}, ${position.y}`);
    // });
    const path = this.path.slice(0, this.definition.speed + 1);
    if (path.length > 0) {
      this.path = this.path.slice(this.definition.speed + 1);
      // console.log("popped path");
      // path.forEach((position) => {
      //   console.log(`${position.x}, ${position.y}`);
      // });
      // console.log("remaining path");
      // this.path.forEach((position) => {
      //   console.log(`${position.x}, ${position.y}`);
      // });
      return path;
    }
    return null;
  }

  activate(initialPosition) {
    this.setPosition(initialPosition.x, initialPosition.y);
    this.setZFromY();
    this.isActive = true;
    this.visible = true;
  }

  playDeathAnimation() {
    if (!this.isActive) {
      return;
    }
    this.isActive = false;
    const deathAnimation = `${this.projectileType}_die`;
    this.anims.play(deathAnimation, true);
    return deathAnimation;
  }

  playAnimation() {
    this.anims.play(`${this.projectileType}_move`, true);
  }

  stopAnimation() {
    this.anims.stop();
  }

  setZFromY() {
    const { y } = this.getTilePosition();
    // projectiles are in front of things
    this.setDepth(y + 1);
  }

  getTilePosition() {
    return this.map.tilemap.worldToTileXY(this.x, this.y);
  }

  isAtTilePosition(tilePosition) {
    const characterTilePosition = this.getTilePosition();
    return characterTilePosition.x === tilePosition.x && characterTilePosition.y === tilePosition.y;
  }
}

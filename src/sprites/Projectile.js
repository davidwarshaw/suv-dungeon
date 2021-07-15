import properties from "../properties";

import projectilesDefinition from "../definitions/projectilesDefinition.json";

import TileMath from "../utils/TileMath";

export default class Projectile extends Phaser.GameObjects.Sprite {
  constructor(scene, map, projectileType, owner) {
    const spritesheet = `projectile-${projectileType}`;
    super(scene, 0, 0, spritesheet);
    this.scene = scene;
    this.map = map;
    this.projectileType = projectileType;
    this.owner = owner;

    scene.add.existing(this);

    this.definition = projectilesDefinition[projectileType];

    this.isAnimated = true;

    this.isActive = false;

    this.setPosition(0, 0);
    this.setZFromY();
    this.visible = false;

    this.path = [];

    scene.anims.create({
      key: `${projectileType}_move`,
      frames: scene.anims.generateFrameNumbers(spritesheet, { start: 0, end: 1 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });
  }

  peakPath() {
    const path = this.path.slice(0, this.definition.speed - 1);
    if (path.length > 0) {
      return path;
    }
    return null;
  }

  popPath() {
    const path = this.path.slice(0, this.definition.speed - 1);
    if (path.length > 0) {
      this.path = this.path.slice(this.definition.speed);
      return path;
    }
    return null;
  }

  activate(initialPosition) {
    this.setPosition(initialPosition.x, initialPosition.y);
    this.isActive = true;
    this.visible = true;
  }

  deactivate() {
    this.visible = false;
    this.isActive = false;
    this.setPosition(0, 0);
  }

  playAnimation() {
    this.anims.play(`${this.projectileType}_move`);
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

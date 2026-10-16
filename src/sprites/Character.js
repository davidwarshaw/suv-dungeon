import properties from "../properties";

import TileMath from "../utils/TileMath";

export default class Character extends Phaser.GameObjects.Sprite {
  constructor(scene, map, tile, characterType) {
    const spritesheet = `${characterType}`;
    super(scene, 0, 0, spritesheet);
    this.scene = scene;
    this.map = map;
    this.characterType = characterType;

    scene.add.existing(this);

    this.isAnimated = true;

    this.isAlive = true;
    this.direction = "left";

    // Origin is more towards the bottom of the sprite
    this.setOrigin(0.5, 0.9);

    const world = TileMath.addHalfTile(map.tilemap.tileToWorldXY(tile.x, tile.y));
    this.setPosition(world.x, world.y);
    this.setZFromY();

    // console.log(`${characterType}_idle_${direction}: start: ${first} end ${first}`);
    scene.anims.create({
      key: `${characterType}_idle`,
      frames: scene.anims.generateFrameNumbers(spritesheet, { start: 0, end: 0 }),
      frameRate: properties.animFrameRate,
      repeat: 0,
    });
    // console.log(`${characterType}_walk_${direction}: start: ${first + 1} end ${first + 3}`);
    scene.anims.create({
      key: `${characterType}_walk`,
      frames: scene.anims.generateFrameNumbers(spritesheet, { start: 0, end: 1 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
      yoyo: false,
    });

    this.stopAnimation();

    // const stopFrame = this.anims.currentAnim.frames[0];
    // this.anims.stopOnFrame(stopFrame);
  }

  playWithFlip(animationKey) {
    if (!this.anims) {
      return;
    }
    // console.log(`${this.direction} ${this.direction.indexOf('left')}`);
    // There is no 'left' animation in the spritesheet. It's just flipped 'left'.
    if (this.direction.indexOf("left") > 0) {
      this.flipX = true;
      this.anims.play(animationKey);
    } else {
      this.flipX = false;
      this.anims.play(animationKey);
    }
  }

  playAnimationForMove(to) {
    // Play moving animation only if different from the one that's playing now
    this.direction = TileMath.directionFromMove(this.getTilePosition(), to);
    const walkAnimationKey = `${this.characterType}_walk`;
    const currentAnimationKey = this.anims.getName();

    // Play a new animation it's different than the previous one, or if nothing is playing
    if (walkAnimationKey !== currentAnimationKey || !this.anims.isPlaying) {
      this.playWithFlip(walkAnimationKey);
    }
  }

  playAnimationForAttack() {}

  stopAnimation() {
    const idleAnimationKey = `${this.characterType}_idle`;
    this.playWithFlip(idleAnimationKey);
  }

  setZFromY() {
    const { y } = this.getTilePosition();
    this.setDepth(y);
  }

  getTilePosition() {
    return this.map.tilemap.worldToTileXY(this.x, this.y);
  }

  isAtTilePosition(tilePosition) {
    const characterTilePosition = this.getTilePosition();
    return characterTilePosition.x === tilePosition.x && characterTilePosition.y === tilePosition.y;
  }
}

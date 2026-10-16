import properties from "../properties";

import TileMath from '../utils/TileMath';

export default class Seal extends Phaser.GameObjects.Sprite {
  constructor(scene, map) {
    super(scene, 0, 0, 'seal');
    this.scene = scene;
    this.map = map;
    
    scene.add.existing(this);

    this.open = false;

    // this.setDepth(1);
    const tilePosition = map.getDoorXY();
    const world = TileMath.addHalfTile(this.map.tilemap.tileToWorldXY(tilePosition.x, tilePosition.y));
    this.setPosition(world.x, world.y);
    // console.log(`tilePosition: ${tilePosition.x}, ${tilePosition.y}`);
    // console.log(`world: ${world.x}, ${world.y}`);

    scene.anims.create({
      key: `seal_idle`,
      frames: scene.anims.generateFrameNumbers('seal', { start: 0, end: 1 }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });

    this.anims.play('seal_idle');
  }

  openUp() {
    this.open = true;
    this.setVisible(false);
  }

  getTilePosition() {
    return this.map.tilemap.worldToTileXY(this.x, this.y);
  }

  isAtTilePosition(tilePosition) {
    const sealTilePosition = this.getTilePosition();
    return sealTilePosition.x === tilePosition.x && sealTilePosition.y === tilePosition.y;
  }

  isPassableAtTilePosition(tilePosition) {
    return this.open && this.isAtTilePosition(tilePosition);
  }
}
import properties from '../properties';

import GameSystem from '../systems/GameSystem';

import Map from '../sprites/Map';
import Player from '../sprites/Player';
import Enemies from '../sprites/Enemies';


export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    this.map = new Map(this, 'test-dynamic');

    this.player = new Player(this, this.map, { x: 4, y: 4 });
    this.enemies = new Enemies(this, this.map);
    this.enemies.add({ x: 12, y: 4 }, "skeleton");

    const widthInPixels = properties.mapWidthTiles * properties.tileWidth;
    const heightInPixels = properties.mapHeightTiles * properties.tileHeight;
    this.cameras.main.setBounds(0, 0, widthInPixels, heightInPixels);
    this.cameras.main.startFollow(this.player, true, 1, 1, 0, 0);

    this.gameSystem = new GameSystem(this, this.map, this.player, this.enemies);

    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer) => this.gameSystem.pointerDown(pointer));
    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => this.gameSystem.pointerUp(pointer));

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off(Phaser.Input.Events.POINTER_DOWN)
      this.input.off(Phaser.Input.Events.POINTER_UP)
    })
  }

  update(time, delta) {
  }

  pointerdown(pointer) {
    // console.log('\nPointer Down:');
    // console.log(`turnState: ${this.turnState}`);
    switch (this.turnState) {
    }
  }
}

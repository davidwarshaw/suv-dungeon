import properties from '../properties';

import GameSystem from '../systems/GameSystem';

import Map from '../sprites/Map';
import Player from '../sprites/Player';
import Enemies from '../sprites/Enemies';
import Seal from '../sprites/Seal';
import Clutter from '../sprites/Clutter';


export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {

    this.scene.launch('HudScene', this.playState);

    this.map = new Map(this, 'test-dynamic', this.playState.level);

    this.player = new Player(this, this.map, this.map.getPlayerSpawnXY());
    this.enemies = new Enemies(this, this.map, this.player, this.playState.level);
    
    this.seal = new Seal(this, this.map);
    this.clutter = new Clutter(this, this.map, this.player, this.enemies, this.playState.level);


    const widthInPixels = this.map.width * properties.tileWidth;
    const heightInPixels = this.map.height * properties.tileHeight;
    const viewportWidth = properties.width - properties.hudWidth;
    this.cameras.main.setViewport(properties.hudWidth, 0, viewportWidth, properties.height);
    this.cameras.main.setBounds(0, 0, widthInPixels, heightInPixels);
    this.cameras.main.startFollow(this.player, true, 1, 1, 0, 0);

    this.gameSystem = new GameSystem(this, this.map, this.player, this.enemies, this.seal, this.clutter);

    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer) => this.gameSystem.pointerDown(pointer));
    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => this.gameSystem.pointerUp(pointer));

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off(Phaser.Input.Events.POINTER_DOWN)
      this.input.off(Phaser.Input.Events.POINTER_UP)
    });

    if (this.playState.level > 0) {
      this.playState.music.menu.stop();
      this.playState.music.game.play({ loop: true, volume: 0.5 });
    }

    this.playState.sfx.engine.play();

    this.firstUpdate = true;
  }

  update(time, delta) {
    if (this.firstUpdate) {
      this.updateHud();
      this.firstUpdate = false;
    }
  }

  updateHud() {
    const speed = Math.abs(this.player.speed);
    const transmission = this.player.getTransmission();
    const healthPercent = this.player.getHealthPercent();
    const total = this.clutter.getNumTotalCrystals();
    const crystals = {
      left: total - this.clutter.getNumCrystals(),
      total,
    }
    const warn = this.player.warn;
    const { cash, skulls, level } = this.playState;
    const room = level + 1;
    this.events.emit('update-hud', { speed, transmission, healthPercent, crystals, warn, cash, skulls, room });
  }

  playerKilled() {
    this.playState.music.game.stop();

    this.scene.stop('HudScene');
    this.scene.start('GameOverScene', this.playState);
  }

  nextLevel() {
    this.playState.music.game.stop();

    this.playState.level += 1;

    this.playState.health = this.player.health;
    this.playState.speed = this.player.speed;

    if (this.playState.level < 7) {
      this.scene.stop('HudScene');
      this.scene.start('GameScene', this.playState);
    } else {
      this.scene.stop('HudScene');
      this.scene.start('WinScene', this.playState);
    }

  }

  pointerdown(pointer) {
    // console.log('\nPointer Down:');
    // console.log(`turnState: ${this.turnState}`);
    switch (this.turnState) {
    }
  }
}

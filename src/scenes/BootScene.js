export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Misc
    this.load.image('font-small', 'assets/fonts/atari_like.png');
    this.load.image('arrow', 'assets/images/arrow.png');
    this.load.spritesheet("large-button-frame", "assets/images/large-button-frame.png", {
      frameWidth: 160,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });
    this.load.image('title-big', 'assets/images/title-big.png');
    
    // HUD
    this.load.image('hud-bg', 'assets/images/hud-bg.png');
    this.load.image('needle', 'assets/images/needle.png');
    this.load.image('needle-small', 'assets/images/needle-small.png');
    this.load.image('warn', 'assets/images/warn.png');

    // Map
    this.load.image('tileset', 'assets/images/maps/tileset.png');

    // Statics
    this.load.image('crystal', 'assets/images/crystal.png');
    this.load.image('wrench', 'assets/images/wrench.png');
    this.load.image('candelabra', 'assets/images/candelabra.png');
    this.load.image('skull', 'assets/images/skull.png');
    this.load.image('cash', 'assets/images/cash.png');

    // Sprites
    this.load.spritesheet('seal', 'assets/images/seal.png', {
      frameWidth: 24,
      frameHeight: 24,
      margin: 0,
      spacing: 0
    });
    this.load.spritesheet('enemy-skeleton', 'assets/images/enemies/skeleton_spritesheet.png', {
      frameWidth: 16,
      frameHeight: 24,
      margin: 0,
      spacing: 0
    });
    this.load.spritesheet('enemy-wraith', 'assets/images/enemies/wraith_spritesheet.png', {
      frameWidth: 16,
      frameHeight: 24,
      margin: 0,
      spacing: 0
    });

    // Sprite Stacks
    this.load.spritesheet('sprite-stack-player', 'assets/images/player/player-alt.vox.png', {
      frameWidth: 24,
      frameHeight: 16,
      margin: 0,
      spacing: 0
    });

    // Audio
    this.load.audio("music-menu", "assets/audio/music-menu.mp3");
    this.load.audio("music-game", "assets/audio/music-game.mp3");
    this.load.audio('enter', 'assets/audio/sfx_menu_select2.wav');
    this.load.audio('walk', 'assets/audio/sfx_movement_footstepsloop4_fast.wav');
    this.load.audio('horn', 'assets/audio/sfx-horn.mp3');
    this.load.audio('engine', 'assets/audio/sfx-engine.mp3');
    this.load.audio('stomp', 'assets/audio/sfx-stomp.mp3');
    this.load.audio('coin', 'assets/audio/sfx-coin.mp3');
  }

  create() {
    this.scene.start('TitleScene');
  }
}

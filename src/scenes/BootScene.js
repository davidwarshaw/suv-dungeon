export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Misc
    this.load.image('font-small', 'assets/fonts/atari_like.png');
    this.load.image('arrow', 'assets/images/arrow.png');

    // Map
    this.load.image('tileset', 'assets/images/maps/tileset.png');

    // Sprites
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
    this.load.spritesheet('sprite-stack-player', 'assets/images/player/player.vox.png', {
      frameWidth: 24,
      frameHeight: 16,
      margin: 0,
      spacing: 0
    });

    // Audio
    this.load.audio('enter', 'assets/audio/sfx_menu_select2.wav');

    this.load.audio('walk', 'assets/audio/sfx_movement_footstepsloop4_fast.wav');

  }

  create() {
    this.scene.start('GameScene');
  }
}

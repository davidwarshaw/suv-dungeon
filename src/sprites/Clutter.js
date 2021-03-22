import properties from "../properties";

import clutterDefinition from '../definitions/clutterDefinition.json';

import TileMath from '../utils/TileMath';

export default class Clutter {
  constructor(scene, map, player, enemies, level) {
    this.scene = scene;
    this.map = map;
    this.player = player;
    this.enemies = enemies;
    this.level = level;

    this.nextId = 0;
    this.list = [];

    this.numCrystals = level + 1;

    const eligibleTiles = this.getEligibleTiles(level * 20);

    // console.log('Adding clutter');
    // console.log(clutterDefinition);
    for (let i = 0; i < eligibleTiles.length; i++) {
      const roll = properties.rng.getUniform();
      // console.log(`roll: ${roll}`);
      if (i < this.numCrystals) {
        // console.log('Adding crystal');
        this.add(eligibleTiles[i], 'crystal');
      } else if (roll <= clutterDefinition['wrench'].density) {
        // console.log('Adding wrench');
        if (level > 2) {
          this.add(eligibleTiles[i], 'wrench');
        }
      } else if (roll <= clutterDefinition['cash'].density) {
        // console.log('Adding cash');
        if (level > 2) {
          this.add(eligibleTiles[i], 'cash');
        }
      } else if (roll <= clutterDefinition['candelabra'].density) {
        // console.log('Adding candelabra');
        if (level > 0) {
          this.add(eligibleTiles[i], 'candelabra');
        }
      }
    }
  }

  getEligibleTiles(numClutter) {
    // console.log(`numClutter: ${numClutter}`);
    const passableTiles = this.map.getPassableTiles();
    const eligibleTiles = passableTiles
      .filter(tile => !this.player.isAtTilePosition(tile))
      .filter(tile => !this.enemies.someAtTilePosition(tile))
      .map(tile => ({ x: tile.x, y: tile.y, randomOrder: properties.rng.getUniform() }))
      .sort((l, r) => l.randomOrder - r.randomOrder);
    return eligibleTiles;
  }

  allCrystalsHaveBeenSmashed() {
    console.log(this.list);
    return this.getNumCrystals() === 0;
  }

  getNumCrystals() {
    const crystals = this.list.filter(clutter => clutter.clutterType === 'crystal');
    return crystals.length;
  }

  getNumTotalCrystals() {
    return this.numCrystals;
  }

  add(tile, clutterType) {
    const world = TileMath.addHalfTile(this.map.tilemap.tileToWorldXY(tile.x, tile.y));
    const clutter = this.scene.add.image(world.x, world.y, clutterType);
    clutter.setOrigin(0.5, 0.9);
    clutter.setDepth(tile.y);
    
    clutter.clutterType = clutterType;
    clutter.clutterId = this.nextId;

    this.list.push(clutter);
    this.nextId++;
  }

  removeById(clutterId) {
    const index = this.list.findIndex(clutter => clutter.clutterId === clutterId);
    this.list.splice(index, 1);
  }

  someAtTilePosition(tilePosition) {
    return this.list.some((clutter) => this.isAtTilePosition(clutter, tilePosition));
  }

  getAtTilePosition(tilePosition) {
    const enemies = this.list.filter((clutter) => this.isAtTilePosition(clutter, tilePosition));
    return enemies[0];
  }

  isAtTilePosition(clutter, tilePosition) {
    const clutterTilePosition = this.map.tilemap.worldToTileXY(clutter.x, clutter.y);
    return clutterTilePosition.x === tilePosition.x && clutterTilePosition.y === tilePosition.y;
  }
}
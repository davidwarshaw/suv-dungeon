import properties from '../properties';

import mapDefinition from '../definitions/mapDefinition';

import TileMath from '../utils/TileMath';
import utils from '../utils/utils';

import MapGenerationSystem from '../systems/MapGenerationSystem';

const CLEAR_HIGHLIGHT = 0xffffff;
const PATH_HIGHLIGHT = 0xffdddd;
const FOV_HIGHLIGHT = 0xddffff;
const CANDIDATE_HIGHLIGHT = 0xddffdd;


export default class Map {
  constructor(scene, currentMap) {
    this.scene = scene;
    this.currentMap = currentMap;

    this.definition = mapDefinition[currentMap];

    this.level = this.scene.playState.level;
    this.width = 10 + 10 * this.level;
    this.height = 10 + 10 * this.level;

    if (this.definition.type === 'static') {
      this.createStaticMap();
    }
    else {
      this.createDynamicMap();
    }

    this.highlightField = {
      path: [],
      candidates: [],
    }

    this.arrows = [];
  }

  createStaticMap() {
    this.tilemap = this.scene.make.tilemap({ key: this.currentMap });
    this.tileset = this.tilemap.addTilesetImage('tileset', 'tileset');
    this.mapLayers = {};

    this.mapLayers.background = this.tilemap.createStaticLayer('background', this.tileset);
    this.mapLayers.collision = this.tilemap.createStaticLayer('collision', this.tileset);
    this.mapLayers.foreground = this.tilemap.createStaticLayer('foreground', this.tileset);
  }

  createDynamicMap() {
    const { tileWidth, tileHeight } = properties;
    const { width, height, level } = this;
    this.tilemap = this.scene.make.tilemap({ tileWidth, tileHeight, width, height });
    this.tileset = this.tilemap.addTilesetImage('tileset', 'tileset');
    this.mapLayers = {};

    this.mapLayers.background = this.tilemap.createBlankLayer('background', this.tileset);
    this.mapLayers.collision = this.tilemap.createBlankLayer('collision', this.tileset);
    this.mapLayers.foreground = this.tilemap.createBlankLayer('foreground', this.tileset);

    MapGenerationSystem.populateBackground(this.definition, this.mapLayers.background, { width, height });
    MapGenerationSystem.populateCollision(this.definition, this.mapLayers.collision, { width, height }, level);
  }

  getPlayerSpawnXY() {
    return {
      x: Math.round(this.width / 2),
      y: Math.round(this.height - 2),
    }
  }

  getDoorXY() {
    const lowerDoors = this.mapLayers.collision
      .filterTiles(tile => tile.index === 12);
    const { x, y } = lowerDoors[0];
    return { x, y };
  }

  getPassableTiles() {
    return this.mapLayers.collision
      .filterTiles(tile => tile.index === -1)
      .map(tile => ({ x: tile.x, y: tile.y }));
  }

  tileIsPassable(tilePosition) {
    const tile = this.mapLayers.collision.getTileAt(tilePosition.x, tilePosition.y);
    return !tile;
  }
  
  tileIsViewable(tilePosition) {
    return this.tileIsPassable(tilePosition);
  }

  tileIsDoor(tilePosition) {
    const { x, y } = this.getDoorXY();
    return tilePosition.x === x && tilePosition.y === y;
  }

  setTileHighlight(tilePosition, tint) {
    const tile = this.mapLayers.background.getTileAt(tilePosition.x, tilePosition.y);
    // console.log('Setting tint:');
    // console.log(tilePosition);
    // console.log(tile);
    if (tile) {
      tile.tint = tint;
    }
  }

  setHighlighting(field, tint) {
    field.forEach(tilePosition => this.setTileHighlight(tilePosition, tint));
  }

  clearHighlighting(field) {
    this.setHighlighting(field, CLEAR_HIGHLIGHT);
  }

  setArrows(player, moveCandidates) {
    this.arrows = Object.values(moveCandidates).map(moveCandidate => {
      const tilePosition = utils.tilePositionFromKey(moveCandidate.key);
      const world = TileMath.addHalfTile(this.tilemap.tileToWorldXY(tilePosition.x, tilePosition.y));
      const image = this.scene.add.image(world.x, world.y, 'arrow');
      image.setDepth(this.height);
      image.rotation = player.rotation + moveCandidate.rotation;
      image.alpha = 0.40;
      return image;
    });
  }

  clearArrows() {
    this.arrows.forEach(arrow => arrow.destroy());
    this.arrows = [];
  }

  highlightPath(path) {
    // console.log('tint path');
    // console.log(path);
    this.clearHighlighting(this.highlightField.path);
    this.highlightField.path = path;
    this.setHighlighting(this.highlightField.path, PATH_HIGHLIGHT);
  }


  highlightMoveCandidates(candidates) {
    // console.log('tint path');
    // console.log(path);
    this.clearHighlighting(this.highlightField.candidates);
    this.highlightField.candidates = Object.keys(candidates).map(key => utils.tilePositionFromKey(key));
    this.setHighlighting(this.highlightField.candidates, CANDIDATE_HIGHLIGHT);
  }
}
import bodyDefinition from '../definitions/bodyDefinition.json';

export default class Body {
  constructor(scene, map, type, spawn) {
    this.scene = scene;
    this.map = map;
    this.type = 'body';

    const key = `body-0${type}`;

    this.tile;

    this.inPlay = false;
    this.maxExposureFactor = 1;
    this.exposureFactor = 0;

    this.matrix = bodyDefinition[key].matrix;

    this.image = scene.add.image(spawn.x, spawn.y, key).setOrigin(0.5, 1);
  }

  dumpFromCart(playerTile) {
    let tileCandidate = this.map.tilemap.worldToTileXY(this.image.x, this.image.y);

    this.inPlay = true;
    this.exposureFactor = this.maxExposureFactor;

    this.image.destroy();
    this.image = null;

    // Find a clear spot to drop the body
    while (
      tileCandidate.y > 0 &&
      !this.map.spaceForBodyIsClear(tileCandidate, this.matrix, playerTile)) {
      tileCandidate.y -= 1;
    }
    
    this.tile = tileCandidate;
    this.map.addBodyTiles(this.tile, this.matrix);
  }

  setPosition(x, y) {
    this.image.setPosition(x, y);
  }
}

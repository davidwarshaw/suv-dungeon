import * as ROT from 'rot-js';

ROT.RNG.setSeed(Date.now());

export default {
  debug: true,
  rng: ROT.RNG,
  width: 320,
  height: 208,
  hudWidth: 80,
  scale: 3,
  tileWidth: 16,
  tileHeight: 16,
  mapWidthTiles: 40,
  mapHeightTiles: 40,
  animFrameRate: 10,
  turnDurationMillis: 200,
  goFlyingMillis: 500,
  numberMillis: 2000,
  sealOpenPanMillis: 2000,
  directions: ['up', 'down', 'left', 'right'],
};

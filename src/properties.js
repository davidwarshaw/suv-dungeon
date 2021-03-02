import * as ROT from 'rot-js';

ROT.RNG.setSeed(Date.now());

export default {
  debug: true,
  rng: ROT.RNG,
  width: 320,
  height: 208,
  scale: 3,
  tileWidth: 16,
  tileHeight: 16,
  mapWidthTiles: 40,
  mapHeightTiles: 40,
  groundLevel: 4,
  animFrameRate: 10,
  turnDurationMillis: 200,
  roundIntervalMillis: 0,
  levelWaitMillis: 2000,
  uiHangMillis: 500,
  directions: ['up', 'down', 'left', 'right'],
  animDirections: ['up', 'down', 'left']
};

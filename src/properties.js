import * as ROT from "rot-js";

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
  letterRateMillis: 50,
  speechWaitMillis: 1000,
  ninePatchDimension: {
    top: 3, // Amount of pixels for top
    bottom: 3, // Amount of pixels for bottom
    left: 3, // Amount of pixels for left
    right: 3, // Amount of pixels for right
  },
  directions: ["up", "down", "left", "right"],
};

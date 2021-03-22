import * as ROT from "rot-js";

import properties from "../properties";

import MapProcedures from "../utils/MapProcedures";

function aheadOfSpawn(x, y, width, height) {
  const playerSpawn = {
    x: Math.round(width / 2),
    y: Math.round(height - 2),
  };
  return (x === playerSpawn.x && y === playerSpawn.y) ||
    (x === playerSpawn.x && y === playerSpawn.y - 1) ||
    (x === playerSpawn.x && y === playerSpawn.y - 2) ||
    (x === playerSpawn.x && y === playerSpawn.y - 3) ||
    (x === playerSpawn.x && y === playerSpawn.y - 4);
}

function populateBackground(definition, layer, dimension) {
  const { width, height } = dimension;
  layer.randomize(
    0,
    0,
    width,
    height,
    definition.tiles.background.base
  );
}

function populateCollision(definition, layer, dimension, level) {
  const { width, height } = dimension;
  const { wall } = definition.tiles.collision;

  let baseMap = MapProcedures.generateBaseMap(width, height);

  // const rotMap = new ROT.Map.DividedMaze(width, height);

  // //const rotMap = new ROT.Map.Uniform(width, height, { roomDugPercentage: 0.9 });
  // rotMap.create((x, y, isWall) => {
  //   baseMap[y][x] = isWall > 0 ? "impassable" : "passable";
  // });

  baseMap = baseMap.map((tileRow, y) =>
    tileRow.map((tile, x) => {
      if (x === 0 || x === width - 1 || y <= 1 || y === height -1) {
        return "impassable";
      }
      if (aheadOfSpawn(x, y, width, height)) {
        // console.log(`spawn pass: ${x}, ${y}`);
        return "passable";
      }
      if (
        ((x - 1) % 8 === 0 || (x - 1) % 8 === 0 || x % 8 === 0 ||
          (x + 1) % 8 === 0 || (x + 2) % 8 === 0) &&
        ((y - 1) % 8 === 0 || (y - 1) % 8 === 0 || y % 8 === 0 ||
          (y + 1) % 8 === 0 || (y + 2) % 8 === 0)) {
        return "impassable";
      }
      return "passable";
    })
  );

  const wallMap = JSON.parse(JSON.stringify(baseMap));
  baseMap.forEach((tileRow, y) => {
    tileRow.forEach((tile, x) => {
      if (tile === "impassable" && MapProcedures.getFromMap(baseMap, x, y + 1) === "passable") {
        wallMap[y][x] = "lower-wall";
      }
    });
  });
  baseMap.forEach((tileRow, y) => {
    tileRow.forEach((tile, x) => {
      if (tile === "impassable" && MapProcedures.getFromMap(wallMap, x, y + 1) === "lower-wall") {
        wallMap[y][x] = "upper-wall";
      }
    });
  });
  baseMap.forEach((tileRow, y) => {
    tileRow.forEach((tile, x) => {
      if (y === 0 && x === Math.round(width / 2)) {
        wallMap[y][x] = "upper-door";
      } else if (y === 1 && x === Math.round(width / 2)) {
        wallMap[y][x] = "lower-door";
      }
    });
  });

  const ceilingMap = JSON.parse(JSON.stringify(wallMap));
  wallMap.forEach((tileRow, y) => {
    tileRow.forEach((tile, x) => {
      const impassableCount = MapProcedures.countNeighbors(wallMap, x, y, "impassable");
      if (tile === "impassable" && impassableCount < 8) {
        const bitArray = MapProcedures.getBitArray(wallMap, x, y, "impassable");
        const autoTile = MapProcedures.getAutoTileFromBitArray(bitArray);
        ceilingMap[y][x] = autoTile;
      }
    });
  });

  ceilingMap.forEach((tileRow, y) => {
    tileRow.forEach((tile, x) => {
      if (tile !== 'passable') {
        const tileIndex = wall[tile] != null ? wall[tile] : wall['default'];
        //const tileIndex = wall[tile] || wall['default'];
        layer.putTileAt(tileIndex, x, y);
      }
    });
  });
  // console.log(ceilingMap);

}

export default {
  populateBackground,
  populateCollision,
};

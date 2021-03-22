import properties from '../properties';

import utils from '../utils/utils';

function edgeTileFromAngle(radians) {
  const x0 = Math.round(properties.localWidth / 2);
  const y0 = Math.round(properties.localHeight / 2);
  const x1 = Math.round(x0 + properties.localWidth * Math.cos(radians));
  const y1 = Math.round(y0 + properties.localHeight * Math.sin(radians));

  // console.log(`${x1}, ${y1}`);
  const ray = tileRay(x0, y0, x1, y1);
  const edgeTile = ray.pop();
  return edgeTile;
}

function tileLine(x0, y0, x1, y1) {
  const linePoints = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;

  let x = x0;
  let y = y0;
  let err = dx - dy;

  linePoints.push({ x, y });
  while (x !== x1 || y !== y1) {
    //console.log(`${x}-${y}`);
    const err2 = 2 * err;
    if (err2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (err2 < dx) {
      err += dx;
      y += sy;
    }
    linePoints.push({ x, y });
  }

  return linePoints;
}

function tileRay(x0, y0, x1, y1) {
  const linePoints = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;

  let x = x0;
  let y = y0;
  let err = dx - dy;

  linePoints.push({ x, y });
  while (
    x !== 0 &&
    x !== properties.localWidth - 1 &&
    (y !== 0 && y !== properties.localHeight - 1)
  ) {
    const err2 = 2 * err;
    if (err2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (err2 < dx) {
      err += dx;
      y += sy;
    }
    linePoints.push({ x, y });
  }

  return linePoints;
}

function tileArc(center, target, rotation, arcLength) {
  const increment = 0.05;
  const startAngle = rotation - arcLength / 2;
  const endAngle = rotation + arcLength / 2;
  const radius = distance(center, target);

  const points = [];
  for (let theta = startAngle + increment; theta < endAngle; theta += increment) {
    const x = Math.round(center.x + (radius * Math.cos(theta)));
    const y = Math.round(center.y + (radius * Math.sin(theta)));
    if (points.indexOf(utils.keyFromTilePosition({ x, y })) === -1) {
      points.push(utils.keyFromTilePosition({ x, y }));
    };
  }

  return points;
}

function tileEllipse(xCenter, yCenter, xAxis, yAxis) {
  const points = {};
  const xBound = Math.round(xAxis);
  const yBound = Math.round(yAxis);
  for (let y = -yBound; y <= yBound; y++) {
    const rowPoints = [];
    for (let x = -xBound; x <= xBound; x++) {
      const row = Math.round(
        (yAxis / xAxis) *
        Math.sqrt(Math.pow(xAxis, 2) - Math.pow(x, 2)));

      // console.log(`${x}, ${y}: row: +/- ${row}`);
      if (y <= row && y >= -row) {
        const mapX = Math.round(xCenter + x);
        const mapY = Math.round(yCenter + y);
        rowPoints.push(utils.keyFromXY(mapX, mapY));
      }
    }
    
    // Only pick the first and last (if it exists) tile in the row for the ellipse
    if (rowPoints.length > 0) {
      points[rowPoints[0]] = true;
    }
    if (rowPoints.length > 1) {
      points[rowPoints[rowPoints.length - 1]] = true;
    }
  }
  return points;
}

function tileCircle(xCenter, yCenter, radius) {
  return tileEllipse(xCenter, yCenter, radius, radius);
}

function tileEllipseFilled(xCenter, yCenter, xAxis, yAxis) {
  const points = {};
  const xBound = Math.round(xAxis);
  const yBound = Math.round(yAxis);
  for (let y = -yBound; y <= yBound; y++) {
    for (let x = -xBound; x <= xBound; x++) {
      const row = Math.round(
        (yAxis / xAxis) *
        Math.sqrt(Math.pow(xAxis, 2) - Math.pow(x, 2)));

      // console.log(`${x}, ${y}: row: +/- ${row}`);
      if (y <= row && y >= -row) {
        const mapX = Math.round(xCenter + x);
        const mapY = Math.round(yCenter + y);
        points[utils.keyFromXY(mapX, mapY)] = true;
      }
    }
  }
  return points;
}

function tileCircleFilled(xCenter, yCenter, radius) {
  return tileEllipseFilled(xCenter, yCenter, radius, radius);
}

function tileFromScreen(screen) {
  const x = Math.floor(screen.x / properties.tileWidth);
  const y = Math.floor(screen.y / properties.tileHeight);
  return { x, y };
}

function screenFromTile(tile) {
  const x = Math.round((0.5 + tile.x) * properties.tileWidth);
  const y = Math.round((0.5 + tile.y) * properties.tileHeight);
  return { x, y };
}

function addHalfTile(point) {
  return { x: point.x + 0.5 * properties.tileWidth, y: point.y + 0.5 * properties.tileHeight };
}

function getTileNeighborByDirection(tile, direction) {
  switch (direction) {
    case 'left': {
      return { x: tile.x - 1, y: tile.y };
    }
    case 'right': {
      return { x: tile.x + 1, y: tile.y };
    }
    case 'up': {
      return { x: tile.x, y: tile.y - 1 };
    }
    case 'down': {
      return { x: tile.x, y: tile.y + 1 };
    }
  }
}

function distance(from, to) {
  return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
}

function transpose(m) {
  const t = [];
  for (var y = 0; y < m.length; y++) {
    t.push([]);
    for (var x = 0; x < m[0].length; x++) {
      t[y].push(m[x][y]);
    }
  }
  return t;
}

function reverseRows(m) {
  return m.map(row => row.reverse());
}

function rotateMatrixClockwise(m) {
  return reverseRows(transpose(m));
}

function rotateMatrixCounterClockwise(m) {
  return transpose(reverseRows(m));
}

function keyFromXY(x, y) {
  return keyFromPoint({ x, y });
}

function keyFromPoint(point) {
  return `${point.x}-${point.y}`;
}

function pointFromKey(key) {
  // console.log(`key: ${key}`);
  const x = parseInt(key.split('-')[0]);
  const y = parseInt(key.split('-')[1]);
  return { x, y };
}

function directionFromMove(from, to) {
  const left = from.x - to.x > 0;
  const right = from.x - to.x < 0;
  const up = from.y - to.y > 0;
  const down = from.y - to.y < 0;
  let directions = [];
  if (up) {
    directions.push('up');
  }
  if (down) {
    directions.push('down');
  }
  if (left) {
    directions.push('left');
  }
  if (right) {
    directions.push('right');
  }
  if (directions.length === 0) {
    directions.push('down');
  }

  return directions.join('-');
}

function rotationFromDirection(direction) {
  const directions = ['right', 'down-right', 'down', 'down-left', 'left', 'up-left', 'up', 'up-right'];
  const numerator = directions.indexOf(direction);
  const rotation = (2 * numerator / directions.length) * Math.PI;
  // console.log(`rotationFromDirection: direction: ${direction} numerator: ${numerator} rotation: ${rotation}`);
  return rotation;
}

function stepFromRotation(rotation) {
  return {
    x: Math.sign(Math.round(Math.cos(rotation))),
    y: Math.sign(Math.round(Math.sin(rotation))),
  }
}

function collisionMapFromTileMap(tileMap) {
  const collision = tileMap.layers.filter(layer => layer.name === 'collision')[0];
  const collisionMap = {};
  collision.data.forEach(row =>
    row.forEach(tile => {
      collisionMap[keyFromPoint(tile)] = tile.index > 0 ? true : false;
    })
  );
  return collisionMap;
}

export default {
  edgeTileFromAngle,
  tileLine,
  tileRay,
  tileArc,
  tileEllipse,
  tileCircle,
  tileEllipseFilled,
  tileCircleFilled,
  tileFromScreen,
  screenFromTile,
  addHalfTile,
  getTileNeighborByDirection,
  distance,
  transpose,
  reverseRows,
  rotateMatrixClockwise,
  rotateMatrixCounterClockwise,
  keyFromXY,
  keyFromPoint,
  pointFromKey,
  directionFromMove,
  rotationFromDirection,
  stepFromRotation,
  collisionMapFromTileMap
};

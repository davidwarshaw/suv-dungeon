function getRandomPassableTiles(map, num) {
  const passable = map.getPassableTiles();
}

function keyFromTilePosition(tilePosition) {
  return `${tilePosition.x}-${tilePosition.y}`;
}

function tilePositionFromKey(key) {
  return { x: Number(key.split('-')[0]), y: Number(key.split('-')[1]) };
}

export default {
  getRandomPassableTiles,
  keyFromTilePosition,
  tilePositionFromKey,
}
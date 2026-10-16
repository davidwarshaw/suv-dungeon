import AStar from '../../utils/AStar';
import TileMath from '../../utils/TileMath';
import utils from '../../utils/utils';

export default class MovementSubSystem {
  constructor(map, player, enemies, seal) {
    this.map = map;
    this.player = player;
    this.enemies = enemies;
    this.seal = seal;

    this.aStar = new AStar(map, player, enemies);

    this.moveCandidates = {};
    this.playerMovePath = [];
  }

  tryToPathPlayer(toTile) {
    const path = this.aStar.findPath(this.player.getTilePosition(), toTile);
    // console.log('path:');
    // console.log(path);
    if (path.length > 1) {
      this.player.setMoveQueue(path);
      return true;
    }
    return false;
  }

  isPathClear(path) {
    return path.every(tilePosition =>
      this.map.tileIsPassable(tilePosition) || this.seal.isPassableAtTilePosition(tilePosition));
  }

  rotationForCandidate(side, i, newSpeed, stepIsDiagnol) {
    const oppositeSide = side === 'left' ? 'right' : 'left';
    const goingBackwards = newSpeed < 0;
    const swapDirection = goingBackwards && ! stepIsDiagnol;
    const turns = {
      left: {
        full: -1 * Math.PI / 2,
        half: -1 * Math.PI / 4
      },
      right: {
        full: 1 * Math.PI / 2,
        half: 1 * Math.PI / 4}
      ,
    }
    let newRotation = 0;
    if (i === Math.abs(newSpeed)) {
      newRotation = swapDirection ? turns[oppositeSide].full : turns[side].full;
    } else if (i === Math.abs(newSpeed) - 1) {
      newRotation = swapDirection ? turns[oppositeSide].half : turns[side].half;
    }

    return Phaser.Math.Angle.Wrap(newRotation);
  }

  stepIsDiagnol(step) {
    return Math.abs(step.x) + Math.abs(step.y) === 2
  }

  rotateStep(step, rotation) {
    const stepRotation = Math.atan2(step.y, step.x);
    return {
      x: Math.round(Math.cos(stepRotation + rotation)),
      y: Math.round(Math.sin(stepRotation + rotation)),
    }
  }

  stepLeft(step) {
    return this.rotateStep(step, -0.5 * Math.PI);
  }

  stepRight(step) {
    return this.rotateStep(step, 0.5 * Math.PI);
  }

  stepLeftDiagnol(step, newSpeed) {
    const sign = newSpeed >= 0 ? -1 : 1;
    const angle = newSpeed >= 0 ? sign * 0.25 : sign * 0.75;
    return this.rotateStep(step, angle * Math.PI);
  }

  stepRightDiagnol(step, newSpeed) {
    const sign = newSpeed >= 0 ? 1 : -1;
    const angle = newSpeed >= 0 ? sign * 0.25 : sign * 0.75;
    return this.rotateStep(step, angle * Math.PI);
  }

  getMovementCenter(playerTile, acceleration) {
    const newSpeed = this.player.speed + acceleration;
    const step = TileMath.stepFromRotation(this.player.rotation);
    const center = {
      x: playerTile.x + (step.x * newSpeed),
      y: playerTile.y + (step.y * newSpeed),
    };
    return center;
  }

  generateCandidates(playerTile, acceleration) {
    const newSpeed = this.player.speed + acceleration;
    const newSpeedMagnitude = Math.abs(newSpeed);
    const step = TileMath.stepFromRotation(this.player.rotation);
    const stepLeft = this.stepLeft(step);
    const stepRight = this.stepRight(step);
    const stepIsDiagnol = this.stepIsDiagnol(step);
    const diagnolCenterLeft = this.stepLeftDiagnol(stepLeft, newSpeed);
    const diagnolCenterRight = this.stepRightDiagnol(stepRight, newSpeed);

    // console.log(`playerTile: ${playerTile.x}, ${playerTile.y}`);
    // console.log(`newSpeed: ${newSpeed}`);
    // console.log(`step: ${step.x}, ${step.y}`);
    // console.log(`stepLeft: ${stepLeft.x}, ${stepLeft.y}`);
    // console.log(`stepRight: ${stepRight.x}, ${stepRight.y}`);
    // console.log(`stepIsDiagnol: ${stepIsDiagnol}`);
    // console.log(`diagnolCenterLeft: ${diagnolCenterLeft.x}, ${diagnolCenterLeft.y}`);
    // console.log(`diagnolCenterRight: ${diagnolCenterRight.x}, ${diagnolCenterRight.y}`);

    const center = this.getMovementCenter(playerTile, acceleration);

    // console.log(`center: ${center.x}, ${center.y}`);
    const candidates = [];
    // The left
    for (let i = 1; i <= newSpeedMagnitude; i++) {
      const nextX = stepIsDiagnol ?
        center.x + (diagnolCenterLeft.x * i) :
        center.x + (stepLeft.x * i);
      const nextY = stepIsDiagnol ?
        center.y + (diagnolCenterLeft.y * i) :
        center.y + (stepLeft.y * i);
      const key = utils.keyFromTilePosition({ x: nextX, y: nextY });
      const rotation = this.rotationForCandidate('left', i, newSpeed, stepIsDiagnol);
      const candidate = { key, rotation, acceleration };
      candidates.push(candidate);
    }
    // The center
    const key = utils.keyFromTilePosition(center);
    const candidate = { key, rotation: 0, acceleration };
    candidates.push(candidate);
    // The right
    for (let i = 1; i <= newSpeedMagnitude; i++) {
      const nextX = stepIsDiagnol ?
        center.x + (diagnolCenterRight.x * i) :
        center.x + (stepRight.x * i);
      const nextY = stepIsDiagnol ?
        center.y + (diagnolCenterRight.y * i) :
        center.y + (stepRight.y * i);
      const key = utils.keyFromTilePosition({ x: nextX, y: nextY });
      const rotation = this.rotationForCandidate('right', i, newSpeed, stepIsDiagnol);
      const candidate = { key, rotation, acceleration };
      candidates.push(candidate);
    }
    return candidates;
  }

  tilePositionInCandidates(tilePosition, candidates) {
    const searchKey = utils.keyFromTilePosition(tilePosition);
    for (let i = 0; i < candidates.length; i++) {
      if (candidates[i].key === searchKey) {
        return true;
      }
    }
    return false;
  }

  generatePlayerMoveCandidates() {
    const playerTile = this.player.getTilePosition();

    const decelCandidates = this.generateCandidates(playerTile, -1);
    const coastCandidates = this.generateCandidates(playerTile, 0);
    const accelCandidates = this.generateCandidates(playerTile, 1);

    const candidates = [].concat(decelCandidates, coastCandidates, accelCandidates);


    // console.log('candidates');
    // console.log(candidates);
    this.moveCandidates = {};
    // console.log(`playerTile: ${playerTile.x}, ${playerTile.y}`);
    candidates.forEach(candidate => {
      const toTilePosition = utils.tilePositionFromKey(candidate.key);
      // console.log(`toTilePosition: ${toTilePosition.x}, ${toTilePosition.y}`);
      const path = TileMath.tileLine(playerTile.x, playerTile.y, toTilePosition.x, toTilePosition.y);
      if (this.isPathClear(path)) {
        const candidateWithPath = Object.assign({}, candidate, { path });
        this.moveCandidates[utils.keyFromTilePosition(toTilePosition)] = candidateWithPath;
      }
    });
    // console.log('this.moveCandidates:');
    // console.log(this.moveCandidates);
  }

  getMoveCandidate(toTile) {
    return this.moveCandidates[utils.keyFromTilePosition(toTile)];
  }

  setPlayerMovePath(toTilePosition) {
    const playerTile = this.player.getTilePosition();
    this.playerMovePath = TileMath.tileLine(playerTile.x, playerTile.y, toTilePosition.x, toTilePosition.y);
  }
}
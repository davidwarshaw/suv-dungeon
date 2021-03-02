import properties from "../properties";

import Async from "../utils/Async";
import TileMath from "../utils/TileMath";

import AiSubSystem from "./subSystems/AiSubSystem";
import MovementSubSystem from "./subSystems/MovementSubSystem";

const CHOOSE_ACTION = "CHOOSE_ACTION";
const PLAYER_TURN = "PLAYER_TURN";
const ENEMY_TURN = "ENEMY_TURN";

const MOVE_ATTACK_ACTION = "MOVE/ATTACK"

export default class GameSystem {
  constructor(scene, map, player, enemies) {
    this.scene = scene;
    this.map = map;
    this.player = player;
    this.enemies = enemies;

    this.state = CHOOSE_ACTION;

    this.aiSubSystem = new AiSubSystem(map, player, enemies);
    this.movementSubSystem = new MovementSubSystem(map, player, enemies);

    // Set the initial move candidates
    this.movementSubSystem.generatePlayerMoveCandidates();

    // Set the initial highlights
    this.map.highlightPath(this.movementSubSystem.playerMovePath);
    this.map.setArrows(this.player, this.movementSubSystem.moveCandidates);

    this.playerAction = {};
    this.enemyActions = [];
  }

  async pointerDown(pointer) {
    const selectedTile = this.tileFromPointer(pointer);
    console.log(`pointerDown: ${selectedTile.x}, ${selectedTile.y}`);
    switch (this.state) {
      case CHOOSE_ACTION: {
        const moveCandidate = this.movementSubSystem.getMoveCandidate(selectedTile);
        if (moveCandidate) {
          this.changeState(PLAYER_TURN);
          this.movementSubSystem.setPlayerMovePath(selectedTile);
          this.playerAction = {
            type: MOVE_ATTACK_ACTION,
            character: this.player,
            moveTo: selectedTile,
            path: moveCandidate.path,
            rotateTo: moveCandidate.rotation,
            acceleration: moveCandidate.acceleration,
          };
          this.player.accelerate(moveCandidate.acceleration);
          this.doRound();
        }
        return;
      }
      // If we're not choosing an action, cancel any current queued move
      default: {
        return;
      }
    }
  }

  async pointerUp(pointer) {
    const tile = this.tileFromPointer(pointer);
    console.log(`pointerUp: ${tile.x}, ${tile.y}`);
  }

  tileFromPointer(pointer) {
    const { worldX, worldY } = pointer;
    const tile = this.map.tilemap.worldToTileXY(worldX, worldY);
    return tile;
  }

  async doRound() {
    
    this.changeState(PLAYER_TURN);
    this.map.clearArrows();
    this.map.highlightPath(this.movementSubSystem.playerMovePath);
    await this.processPlayerAction();
    
    this.changeState(ENEMY_TURN);
    this.determineEnemyActions();
    await this.processEnemyActions();
    this.movementSubSystem.generatePlayerMoveCandidates();
    this.map.setArrows(this.player, this.movementSubSystem.moveCandidates);
    
    this.changeState(CHOOSE_ACTION);
    // await Async.sleep(properties.roundIntervalMillis);
  }

  determineEnemyActions() {
    console.log("determineEnemyActions:");
    for (const enemy of this.enemies.list) {
      // enemy.setNextTurn(this.aiSubSystem.determineTurn(enemy));
      // enemy.recalculateFov();
    }
  }

  async processPlayerAction() {
    console.log("processPlayerAction:");
    const nodes = this.playerAction.path.slice(0, -1).map((from, i) => {
      const to = this.playerAction.path.slice(1)[i];
      return { from, to };
    });
    const shortestRotationDelta = Phaser.Math.Angle.ShortestBetween(
      this.player.rotation,
      this.player.rotation + this.playerAction.rotateTo
      );
    const deltaFraction =  shortestRotationDelta / nodes.length;
    // const duration = 0.05 * (properties.turnDurationMillis / nodes.length);
    // console.log(`duration: ${duration}`);
    for (let node of nodes) {
      const { from, to } = node;
      const action = Object.assign({}, this.playerAction);
      action.moveTo = to;
      action.rotateTo = deltaFraction;
      await this.animationPromiseFromAction(action, 0);
    };
  }

  async processEnemyActions() {
    console.log("processEnemyActions:");
    // Each enemy move takes the entire turn
    const duration = properties.turnDurationMillis;
    const animationPromises = this.enemyActions.map(action => this.animationPromiseFromAction(action, duration));
    return Promise.all(animationPromises);
  }

  animationPromiseFromAction(action, duration) {
    console.log(action);
    const { character, type } = action;
    switch (type) {
      case MOVE_ATTACK_ACTION: {
        return this.characterMovePromise(character, action.moveTo, action.rotateTo, duration);
      }
    }
  }

  tryToTakeCharacterTurn(character) {
    // Left pop turn from the queue
    console.log("tryToTakeCharacterTurn:");
    const turn = character.popNextTurn();
    if (!turn) {
      console.log(`No more ${character.characterType} turns`);
      return;
    }
    console.log(`${character.characterType} action: ${turn.type}`);
    switch (turn.type) {
      case "WAIT": {
        // Do nothing
        return;
      }
      case "WATCH": {
        character.direction = turn.direction;
        character.stopAnimation();
        return;
      }
      case "MOVE": {
        return this.characterMovePromise(character, turn.to);
      }
      case "MELEE": {
        return;
      }
    }
  }

  async characterMovePromise(character, to, rotation, duration) {
    console.log(`character: ${character.characterType} to: ${to.x}, ${to.y}`);
    // TODO:
    //character.playAnimationForMove(to);

    // Tween movement
    const toTileWorld = TileMath.addHalfTile(this.map.tilemap.tileToWorldXY(to.x, to.y));
    const shortestRotationDelta = Phaser.Math.Angle.ShortestBetween(character.rotation, character.rotation + rotation);
    const newRotation = character.rotation + shortestRotationDelta;
    // const newRotation = character.rotation + rotation;
    const movePromise = Async.tween(this.scene, {
      targets: character,
      x: toTileWorld.x,
      y: toTileWorld.y,
      duration: properties.turnDurationMillis,
    });
    const turnPromise = character.rotatesWhenTurning ?
      Async.tween(this.scene, {
        targets: character,
        rotation: newRotation,
        duration: properties.turnDurationMillis,
      }) :
      Promise.resolve(true);

    return Promise
      .all([movePromise, turnPromise]);
  }

  changeState(newState) {
    if (newState !== this.state) {
      console.log(`Changing state to: ${newState}`);
      this.state = newState;
    } else {
      console.log(`Redundant state change to: ${newState}`);
    }
  }
}

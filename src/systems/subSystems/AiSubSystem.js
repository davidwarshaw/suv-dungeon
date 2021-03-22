
import AStar from '../../utils/AStar';
import TileMath from '../../utils/TileMath';
import utils from '../../utils/utils';

const IDLE_MODE = "IDLE";
const PATHING_MODE = "PATHING";
const ATTACK_MODE = "ATTACK";

const WAIT_ACTION = "WAIT";
const MOVE_ACTION = "MOVE"
const MELEE_ACTION = "MELEE"

export default class AiSubSystem {
  constructor(map, player, enemies, clutter) {
    this.map = map;
    this.player = player;
    this.enemies = enemies;
    this.clutter = clutter;

    this.aStar = new AStar(map, player, enemies, clutter);

  }

  alreadyMoveToTile(tilePosition, enemyActions) {
    return enemyActions
      .filter(action => action && action.type !== WAIT_ACTION)
      .some(action => {
        return action.moveTo.x === tilePosition.x && action.moveTo.y === tilePosition.y
      });
  }

  pathToPlayer(enemy) {
    const enemyTile = enemy.getTilePosition();
    const playerTile = this.player.getTilePosition();
    const path = this.aStar.findPath(enemyTile, playerTile);
    return path;
  }

  pathIsClear(path) {
    return path.every(tilePosition => this.map.tileIsPassable(tilePosition));
  }

  enemyCanSeePlayer(enemy) {
    const enemyTile = enemy.getTilePosition();
    const playerTile = this.player.getTilePosition();
    const path = TileMath.tileLine(enemyTile.x, enemyTile.y, playerTile.x, playerTile.y);
    return this.pathIsClear(path) && path.length <= enemy.definition.sightRange;
  }

  enemyCanMeleePlayer(enemy) {
    const enemyTile = enemy.getTilePosition();
    const playerTile = this.player.getTilePosition();
    const path = TileMath.tileLine(enemyTile.x, enemyTile.y, playerTile.x, playerTile.y);
    return path.length == 2 && this.pathIsClear(path) && path.length <= enemy.definition.sightRange;
  }

  actionForMelee(enemy) {
    return {
      type: MELEE_ACTION,
      character: enemy,
      moveTo: this.player.getTilePosition(),
    };    
  }

  actionForNewPathToPlayer(enemy, enemyActions) {
    const path = this.pathToPlayer(enemy);
    if (path.length > 1) {
      // Set enemy path
      // We skip the first tile, which is where the enemy is now
      enemy.path = path.slice(2);
      const moveTo = path[1];
      // If someone is already moving here, skip it
      if (this.alreadyMoveToTile(moveTo, enemyActions)) {
        return this.actionForWait(enemy);
      }
      return {
        type: MOVE_ACTION,
        character: enemy,
        moveTo,
        path,
      };
    }
  }

  actionForOldPathToPlayer(enemy, enemyActions) {
    const moveTo = enemy.popPath();
    const path = enemy.path;
    // If someone is already moving here, skip it
    if (this.alreadyMoveToTile(moveTo, enemyActions)) {
      return this.actionForWait(enemy);
    }
    return {
      type: MOVE_ACTION,
      character: enemy,
      moveTo,
      path,
    };
  }

  enemyHasOldPath(enemy) {
    return enemy.peakPath();
  }

  actionForWait(enemy) {
    return {
      type: WAIT_ACTION,
      character: enemy,
    };
  }

  determineAction(enemy, enemyActions) {
    switch (enemy.aiMode) {
      case IDLE_MODE: {
        if (this.enemyCanSeePlayer(enemy)) {
          if (this.enemyCanMeleePlayer(enemy)) {
            enemy.aiMode = ATTACK_MODE;
            return this.actionForMelee(enemy);
          }
          enemy.aiMode = PATHING_MODE;
          return this.actionForNewPathToPlayer(enemy, enemyActions);
        }
        break;
      }
      case ATTACK_MODE:
      case PATHING_MODE: {
        if (this.enemyCanSeePlayer(enemy)) {
          if (this.enemyCanMeleePlayer(enemy)) {
            enemy.aiMode = ATTACK_MODE;
            return this.actionForMelee(enemy);
          }
          return this.actionForNewPathToPlayer(enemy, enemyActions);
        } else if (this.enemyHasOldPath(enemy)) {
          return this.actionForOldPathToPlayer(enemy, enemyActions);
        }
        break;
      }
    }
    enemy.aiMode = IDLE_MODE;
    return this.actionForWait(enemy);
  }
}
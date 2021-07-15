import AStar from "../../utils/AStar";
import TileMath from "../../utils/TileMath";

const IDLE_MODE = "IDLE";
const PATHING_MODE = "PATHING";
const ATTACK_MODE = "ATTACK";

const WAIT_ACTION = "WAIT";
const MOVE_ACTION = "MOVE";
const MELEE_ACTION = "MELEE";
const MISSILE_FIRE_ACTION = "MISSILE_FIRE";
const MISSILE_MOVE_ACTION = "MISSILE_MOVE";

const MOVE_ACTIONS = [MOVE_ACTION, MELEE_ACTION];

export default class AiSubSystem {
  constructor(map, player, enemies, clutter, movementSubSystem) {
    this.map = map;
    this.player = player;
    this.enemies = enemies;
    this.clutter = clutter;
    this.movementSubSystem = movementSubSystem;

    this.aStar = new AStar(map, player, enemies, clutter);
  }

  alreadyMoveToTile(tilePosition, enemyActions) {
    return enemyActions
      .filter((action) => action && MOVE_ACTIONS.includes(action.type))
      .some((action) => {
        return action.moveTo.x === tilePosition.x && action.moveTo.y === tilePosition.y;
      });
  }

  pathToPlayer(enemy) {
    const enemyTile = enemy.getTilePosition();
    const playerTile = this.player.getTilePosition();
    const path = this.aStar.findPath(enemyTile, playerTile);
    return path;
  }

  pathAwayFromPlayer(enemy, enemyActions) {
    const enemyTile = enemy.getTilePosition();
    const playerTile = this.player.getTilePosition();
    const angleToPlayer = Phaser.Math.Angle.Between(
      enemyTile.x,
      enemyTile.y,
      playerTile.x,
      playerTile.y
    );
    const angleAwayFromPlayer = angleToPlayer + Math.PI;
    const step = TileMath.stepFromRotation(angleAwayFromPlayer);
    const destination = {
      x: enemyTile.x + step.x,
      y: enemyTile.y + step.y,
    };
    if (
      !this.map.tileIsPassable(destination) ||
      !this.positionCanBeMovedTo(destination, enemyActions)
    ) {
      return [];
    }
    const path = [enemyTile, destination];
    return path;
  }

  expectedNextPositionPlayer() {
    const playerTile = this.player.getTilePosition();
    // Expected acceleration is zero
    const acceleration = 0;
    const nextPosition = this.movementSubSystem.getMovementCenter(playerTile, acceleration);
    return nextPosition;
  }

  pathIsPassable(path) {
    return path.every((tilePosition) => this.map.tileIsPassable(tilePosition));
  }

  pathIsFreeOfEnemies(path) {
    return path.every((tilePosition) => this.enemies.noneAtTilePosition(tilePosition));
  }

  positionCanBeMovedTo(tilePosition, enemyActions) {
    return (
      this.enemies.noneAtTilePosition(tilePosition) &&
      !this.alreadyMoveToTile(tilePosition, enemyActions)
    );
  }

  getEnemyToPlayerPath(enemy) {
    const enemyTile = enemy.getTilePosition();
    const playerTile = this.player.getTilePosition();
    const path = TileMath.tileLine(enemyTile.x, enemyTile.y, playerTile.x, playerTile.y);
    return path;
  }

  enemyCanSeePlayer(enemy) {
    const path = this.getEnemyToPlayerPath(enemy);
    return this.pathIsPassable(path) && path.length <= enemy.definition.sightRange;
  }

  enemyCanMeleePlayer(enemy) {
    const path = this.getEnemyToPlayerPath(enemy);
    return (
      path.length == 2 && this.pathIsPassable(path) && path.length <= enemy.definition.sightRange
    );
  }

  enemyCanMissilePlayer(enemy) {
    const path = this.getEnemyToPlayerPath(enemy);
    return (
      !enemy.projectile.isActive &&
      this.pathIsPassable(path) &&
      this.pathIsFreeOfEnemies(path.slice(1)) &&
      path.length <= enemy.definition.sightRange
    );
  }

  actionForMelee(enemy) {
    return {
      type: MELEE_ACTION,
      character: enemy,
      moveTo: this.player.getTilePosition(),
    };
  }

  actionForMissileFire(enemy, enemyActions) {
    // Set projectile path
    const path = this.getEnemyToPlayerPath(enemy);
    // We skip the first tile, which is where the enemy is now
    enemy.projectile.path = path.slice(2);
    const moveTo = path[1];
    // If someone is already moving here, skip it
    if (this.alreadyMoveToTile(moveTo, enemyActions)) {
      return this.actionForWait(enemy);
    }
    return {
      type: MISSILE_FIRE_ACTION,
      character: enemy,
    };
  }

  actionForProjectileMove(projectile) {
    const moveToNodes = projectile.popPath();
    const path = projectile.path;
    return {
      type: MISSILE_MOVE_ACTION,
      projectile,
      moveToNodes,
      path,
    };
  }

  actionForNewPathToPlayer(enemy, enemyActions) {
    const path = this.pathToPlayer(enemy);
    if (path.length > 1) {
      return this.actionForNewPathTo(enemy, enemyActions, path);
    }
  }

  actionForNewPathAwayFromPlayer(enemy, enemyActions) {
    const path = this.pathAwayFromPlayer(enemy, enemyActions);
    if (path.length > 1) {
      return this.actionForNewPathTo(enemy, enemyActions, path);
    }
  }

  actionForNewPathTo(enemy, enemyActions, path) {
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

  actionForOldPath(enemy, enemyActions) {
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
    const { behavior } = enemy.definition;
    console.log(`determineAction: behavior: ${behavior}`);
    switch (behavior) {
      case "follow-for-melee":
        return this.followForMelee(enemy, enemyActions);
      case "avoid-and-missile":
        return this.avoidAndMissile(enemy, enemyActions);
    }
    return this.actionForWait(enemy);
  }

  followForMelee(enemy, enemyActions) {
    console.log("followForMelee");
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
          return this.actionForOldPath(enemy, enemyActions);
        }
        break;
      }
    }
    enemy.aiMode = IDLE_MODE;
    return this.actionForWait(enemy);
  }

  avoidAndMissile(enemy, enemyActions) {
    console.log("avoidAndMissile");
    switch (enemy.aiMode) {
      case IDLE_MODE: {
        if (this.enemyCanSeePlayer(enemy)) {
          if (this.enemyCanMissilePlayer(enemy)) {
            enemy.aiMode = ATTACK_MODE;
            return this.actionForMissileFire(enemy, enemyActions);
          }
          enemy.aiMode = PATHING_MODE;
          return this.actionForNewPathAwayFromPlayer(enemy, enemyActions);
        }
        break;
      }
      case ATTACK_MODE:
      case PATHING_MODE: {
        if (this.enemyCanSeePlayer(enemy)) {
          if (this.enemyCanMissilePlayer(enemy)) {
            enemy.aiMode = ATTACK_MODE;
            return this.actionForMissileFire(enemy, enemyActions);
          }
          return this.actionForNewPathAwayFromPlayer(enemy, enemyActions);
        } else if (this.enemyHasOldPath(enemy)) {
          return this.actionForOldPath(enemy, enemyActions);
        }
        break;
      }
    }
    enemy.aiMode = IDLE_MODE;
    return this.actionForWait(enemy);
  }
}

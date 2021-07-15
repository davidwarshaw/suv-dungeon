import properties from "../properties";

import clutterDefinition from "../definitions/clutterDefinition.json";

import Async from "../utils/Async";
import TileMath from "../utils/TileMath";

import RisingNumbers from "../ui/RisingNumbers";

import AiSubSystem from "./subSystems/AiSubSystem";
import AttackSubSystem from "./subSystems/AttackSubSystem";
import MovementSubSystem from "./subSystems/MovementSubSystem";

const CHOOSE_ACTION = "CHOOSE_ACTION";
const PLAYER_TURN = "PLAYER_TURN";
const ENEMY_TURN = "ENEMY_TURN";

const WAIT_ACTION = "WAIT";
const MOVE_ACTION = "MOVE";
const MELEE_ACTION = "MELEE";
const MISSILE_FIRE_ACTION = "MISSILE_FIRE";
const MISSILE_MOVE_ACTION = "MISSILE_MOVE";

const MAX_DEPTH = 1000;

export default class GameSystem {
  constructor(scene, map, player, enemies, seal, clutter) {
    this.scene = scene;
    this.map = map;
    this.player = player;
    this.enemies = enemies;
    this.seal = seal;
    this.clutter = clutter;

    this.state = CHOOSE_ACTION;

    this.movementSubSystem = new MovementSubSystem(map, player, enemies, seal);
    this.attackSubSystem = new AttackSubSystem(map, player, enemies);
    this.aiSubSystem = new AiSubSystem(map, player, enemies, clutter, this.movementSubSystem);

    // Set the initial move candidates
    this.movementSubSystem.generatePlayerMoveCandidates();

    // Set the initial highlights
    this.map.highlightPath(this.movementSubSystem.playerMovePath);
    this.map.setArrows(this.player, this.movementSubSystem.moveCandidates);

    this.playerAction = {};
    this.enemyActions = [];

    this.totalPlayerDamage = 0;
  }

  async pointerDown(pointer) {
    const selectedTile = this.tileFromPointer(pointer);
    // console.log(`pointerDown: ${selectedTile.x}, ${selectedTile.y}`);
    switch (this.state) {
      case CHOOSE_ACTION: {
        const moveCandidate = this.movementSubSystem.getMoveCandidate(selectedTile);
        if (moveCandidate) {
          this.changeState(PLAYER_TURN);
          this.movementSubSystem.setPlayerMovePath(selectedTile);
          this.playerAction = {
            type: MOVE_ACTION,
            character: this.player,
            moveTo: selectedTile,
            path: moveCandidate.path,
            rotateTo: moveCandidate.rotation,
            acceleration: moveCandidate.acceleration,
          };
          this.player.accelerate(moveCandidate.acceleration);
          this.doRound();
        } else if (this.player.isAtTilePosition(selectedTile)) {
          this.scene.playState.sfx.horn.play();
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
    // console.log(`pointerUp: ${tile.x}, ${tile.y}`);
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
    this.scene.updateHud();

    this.changeState(ENEMY_TURN);
    this.determineEnemyActions();
    await this.processEnemyActions();
    this.scene.updateHud();

    this.movementSubSystem.generatePlayerMoveCandidates();
    // Stop player and show warning if no move candidates
    if (Object.keys(this.movementSubSystem.moveCandidates).length === 0) {
      this.player.speed = 0;
      this.player.warn = true;
      this.movementSubSystem.generatePlayerMoveCandidates();
      this.scene.cameras.main.shake();
    } else {
      this.player.warn = false;
    }
    this.map.setArrows(this.player, this.movementSubSystem.moveCandidates);
    this.scene.updateHud();

    this.changeState(CHOOSE_ACTION);
  }

  determineEnemyActions() {
    // console.log("determineEnemyActions:");
    this.enemyActions = [];
    for (const enemy of this.enemies.list) {
      if (enemy.isAlive) {
        const action = this.aiSubSystem.determineAction(enemy, this.enemyActions);
        this.enemyActions.push(action);
      }
    }
    for (const projectile of this.enemies.listProjectiles) {
      if (projectile.isAlive) {
        const action = this.aiSubSystem.actionForProjectileMove(projectile);
        this.enemyActions.push(action);
      }
    }
  }

  async processPlayerAction() {
    // console.log("processPlayerAction:");
    const nodes = this.playerAction.path.slice(0, -1).map((from, i) => {
      const to = this.playerAction.path.slice(1)[i];
      return { from, to };
    });
    const shortestRotationDelta = Phaser.Math.Angle.ShortestBetween(
      this.player.rotation,
      this.player.rotation + this.playerAction.rotateTo
    );
    const deltaFraction = shortestRotationDelta / nodes.length;
    const duration = properties.turnDurationMillis / nodes.length;

    // console.log(`nodes.length: ${nodes.length}`);
    // console.log(`properties.turnDurationMillis: ${properties.turnDurationMillis}`);
    // console.log(`duration: ${duration}`);
    for (let node of nodes) {
      const { to } = node;
      const action = Object.assign({}, this.playerAction);
      action.moveTo = to;
      action.rotateTo = deltaFraction;
      await this.animationPromiseFromAction(action, duration);

      if (this.enemies.someAtTilePosition(to)) {
        const attackedEnemy = this.enemies.getAtTilePosition(to);
        const { damage, wasKilled } = this.attackSubSystem.resolvePlayerAttack(attackedEnemy);

        // Damage numbers over enemies
        new RisingNumbers(this.scene, attackedEnemy, -damage, "white");

        if (wasKilled) {
          this.scene.playState.skulls += 1;
          this.enemies.removeById(attackedEnemy.enemyId);
          this.goFlyingPromise(attackedEnemy).then(() => attackedEnemy.destroy());

          this.scene.playState.sfx.stomp.play();
        }
      } else if (this.clutter.someAtTilePosition(to)) {
        const hitClutter = this.clutter.getAtTilePosition(to);
        this.clutterEffect(hitClutter);
        this.clutter.removeById(hitClutter.clutterId);
        // Check if we should unseal the door
        if (!this.seal.open && this.clutter.allCrystalsHaveBeenSmashed()) {
          this.seal.openUp();
        }
        this.goFlyingPromise(hitClutter).then(() => hitClutter.destroy());
      }

      // Check if we're going into the door
      if (this.map.tileIsDoor(to)) {
        this.scene.nextLevel();
      }
    }
  }

  async processEnemyActions() {
    // console.log("processEnemyActions:");
    // Each enemy move takes the entire turn
    const duration = properties.turnDurationMillis;
    const animationPromises = this.enemyActions
      .filter((action) => action)
      .map((action) => this.animationPromiseFromAction(action, duration));
    return Promise.all(animationPromises).then(() => {
      // Show damage numbers over the player
      if (this.totalPlayerDamage > 0) {
        new RisingNumbers(this.scene, this.player, -this.totalPlayerDamage, "red");
        this.totalPlayerDamage = 0;
      }
    });
  }

  animationPromiseFromAction(action, duration) {
    const { character, type } = action;
    switch (type) {
      case MOVE_ACTION: {
        return this.characterMovePromise(character, action.moveTo, action.rotateTo, duration);
      }
      case MELEE_ACTION: {
        return this.characterMeleePromise(character, action.moveTo, duration);
      }
      case MISSILE_FIRE_ACTION: {
        return this.characterMissileFirePromise(character, duration);
      }
      case MISSILE_MOVE_ACTION: {
        return this.characterMissileMovePromise(character, action.moveTo, duration);
      }
    }
  }

  async characterMovePromise(character, to, rotation, duration) {
    console.log(`character: ${character.characterType} to: ${to.x}, ${to.y}`);

    if (character.isAnimated) {
      character.playAnimationForMove(to);
    }

    // Tween movement
    const toTileWorld = TileMath.addHalfTile(this.map.tilemap.tileToWorldXY(to.x, to.y));
    const shortestRotationDelta = Phaser.Math.Angle.ShortestBetween(
      character.rotation,
      character.rotation + rotation
    );
    const newRotation = character.rotation + shortestRotationDelta;

    const movePromise = Async.tween(this.scene, {
      targets: character,
      x: toTileWorld.x,
      y: toTileWorld.y,
      duration: duration,
    });
    const turnPromise = !character.isAnimated
      ? Async.tween(this.scene, {
          targets: character,
          rotation: newRotation,
          duration: duration,
        })
      : Promise.resolve(true);

    return Promise.all([movePromise, turnPromise]).then(() => {
      // Character could be killed at this point
      if (character.isAnimated && character.isAlive) {
        character.stopAnimation();
      }
      character.setZFromY();
    });
  }

  async characterMeleePromise(character, to, duration) {
    console.log(`character: ${character.characterType} melee to: ${to}`);

    character.playAnimationForMove(to);

    const toTileWorld = TileMath.addHalfTile(this.map.tilemap.tileToWorldXY(to.x, to.y));
    const meleePromise = Async.tween(this.scene, {
      targets: character,
      x: toTileWorld.x,
      y: toTileWorld.y,
      repeat: 0,
      yoyo: true,
      duration: duration,
    });

    return meleePromise.then(() => {
      if (character.isAnimated) {
        character.stopAnimation();
      }

      const { damage, wasKilled } = this.attackSubSystem.resolveEnemyAttack(character);

      // Don't show player damage until after all the animation
      this.totalPlayerDamage += damage;

      if (wasKilled) {
        this.scene.playerKilled();
      }
    });
  }

  async characterMissileFirePromise(character, to, duration) {
    console.log(`character: ${character.characterType} missile to: ${to}`);

    character.playAnimationForAttack(to);
    character.projectile.activate(character);

    const missilePromise = Async.tween(this.scene, {
      targets: character,
      duration: duration,
    });

    return missilePromise.then(() => {
      if (character.isAnimated) {
        character.stopAnimation();
      }
    });
  }

  async characterMissileMovePromise(projectile, to, duration) {
    console.log(`projectile: ${projectile.projectileType} missile to: ${to}`);

    projectile.playAnimation();

    const toTileWorld = TileMath.addHalfTile(this.map.tilemap.tileToWorldXY(to.x, to.y));
    const missilePromise = Async.tween(this.scene, {
      targets: projectile,
      x: toTileWorld.x,
      y: toTileWorld.y,
      repeat: 0,
      yoyo: false,
      duration: duration,
    });

    return missilePromise.then(() => {
      // const { damage, wasKilled } = this.attackSubSystem.resolveEnemyAttack(character);
      // // Don't show player damage until after all the animation
      // this.totalPlayerDamage += damage;
      // if (wasKilled) {
      //   this.scene.playerKilled();
      // }
      projectile.stopAnimation();
      projectile.setZFromY();
    });
  }

  async goFlyingPromise(enemy, speedOverride, rotationOverride) {
    const speed = speedOverride || this.player.speed;
    const direction = rotationOverride || this.player.rotation;
    // Spin from the middle
    enemy.setOrigin(0.5);
    // Set z to top
    enemy.setDepth(MAX_DEPTH);

    const playerRotationSign = speed > 0 ? 1 : -1;
    const speedFraction = Math.abs(speed / this.player.maxSpeed);

    const scalePromise = Async.tween(this.scene, {
      targets: enemy,
      scale: 1 + speedFraction * 5,
      duration: properties.goFlyingMillis,
    });
    const rotationPromise = Async.tween(this.scene, {
      targets: enemy,
      rotation: Math.PI * (2 + speedFraction * 2),
      duration: properties.goFlyingMillis,
    });
    const playerDirection = {
      x: Math.cos(direction),
      y: Math.sin(direction),
    };

    const directionFactor = playerRotationSign * speedFraction * 512;

    const movePromise = Async.tween(this.scene, {
      targets: enemy,
      x: enemy.x + directionFactor * playerDirection.x,
      y: enemy.y + directionFactor * playerDirection.y,
      duration: properties.goFlyingMillis,
    });
    return Promise.all([scalePromise, rotationPromise, movePromise]);
  }

  clutterEffect(hitClutter) {
    switch (hitClutter.clutterType) {
      case "crystal": {
        this.scene.playState.gameCrystals += 1;
        this.scene.playState.sfx.stomp.play();
        break;
      }
      case "wrench": {
        const health = clutterDefinition[hitClutter.clutterType].health;
        this.attackSubSystem.healPlayer(health);
        new RisingNumbers(this.scene, this.player, health, "white");
        this.scene.playState.sfx.coin.play();
        break;
      }
      case "cash": {
        this.scene.playState.cash += 1;
        this.scene.playState.sfx.coin.play();
        break;
      }
      default: {
        this.scene.playState.sfx.stomp.play();
        break;
      }
    }
  }

  bustDownDoors() {
    const tile = this.player.getTilePosition();
    const world = TileMath.addHalfTile(this.map.tilemap.tileToWorldXY(tile.x, tile.y));
    const leftDoor = this.scene.add.image(world.x, world.y, "door");
    leftDoor.setOrigin(0.5, 0.9);
    leftDoor.setDepth(tile.y);

    const rightDoor = this.scene.add.image(world.x, world.y, "door");
    rightDoor.flipX = true;
    rightDoor.setOrigin(0.5, 0.9);
    rightDoor.setDepth(tile.y);

    const leftSpeed = properties.rng.getNormal(3, 1);
    const leftDirection = properties.rng.getNormal(1.5 * Math.PI, 0.2);
    this.goFlyingPromise(leftDoor, leftSpeed, leftDirection).then(() => leftDoor.destroy());

    const rightSpeed = properties.rng.getNormal(3, 1);
    const rightDirection = properties.rng.getNormal(1.5 * Math.PI, 0.2);
    this.goFlyingPromise(rightDoor, rightSpeed, rightDirection).then(() => rightDoor.destroy());

    this.speechChangeTimer = this.scene.time.delayedCall(properties.letterRateMillis, () =>
      this.scene.cameras.main.shake()
    );
  }

  changeState(newState) {
    if (newState !== this.state) {
      // console.log(`Changing state to: ${newState}`);
      this.state = newState;
    } else {
      // console.log(`Redundant state change to: ${newState}`);
    }
  }
}

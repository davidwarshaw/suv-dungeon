
const PATROL = 'PATROL';
const WATCH = 'WATCH';
const WAIT = 'WAIT';

export default class AiSubSystem {
  constructor(map, player, enemies) {
    this.map = map;
    this.player = player;
    this.enemies = enemies;

  }

  rotateDirectionClockwise(direction) {
    switch (direction) {
      case 'up': {
        return 'right';
        break;
      }
      case 'down': {
        return 'left';
        break;
      }
      case 'left': {
        return 'up';
        break;
      }
      case 'right': {
        return 'down';
        break;
      }
    }
  }

  determineTurn(enemy) {
    console.log(`determineTurn(enemy): ${enemy.aiMode}`);
    // Waiting has the highest priority
    const mustWait = enemy.popWait();
    if (mustWait) {
      return { type: 'WAIT' };
    }
    switch (enemy.aiMode) {
      case PATROL: {
        return {};
      }
      case WATCH: {
        const direction = this.rotateDirectionClockwise(enemy.direction);
        // Wait a few turns after watching
        enemy.setWait(1);
        return { type: 'WATCH', direction };
      }
    }
  }
}
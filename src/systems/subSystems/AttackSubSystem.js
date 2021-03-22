
export default class AttackSubSystem {
  constructor(map, player, enemies) {
    this.map = map;
    this.player = player;
    this.enemies = enemies;
  }

  resolvePlayerAttack(enemy) {
    // console.log('resolvePlayerAttack');
    // console.log(enemy);
    let wasKilled = false;
    const { speed, damageSpeedFactor } = this.player;
    const damage = Math.abs(speed) * damageSpeedFactor;

    enemy.health = enemy.health - damage;
    if (enemy.health <= 0) {
      enemy.health = 0;
      enemy.isAlive = false;
      wasKilled = true;
    }

    return { damage, wasKilled };
  }

  resolveEnemyAttack(enemy) {
    // console.log('resolveEnemyAttack');
    // console.log(enemy);
    let wasKilled = false;
    const damage = enemy.definition.damage;
    
    this.player.health = this.player.health - damage;
    if (this.player.health <= 0) {
      this.player.health = 0;
      this.player.isAlive = false;
      wasKilled = true;
    }

    return { damage, wasKilled };
  }

  healPlayer(health) {
    // console.log('healPlayer');
    // console.log(health);
    this.player.health = this.player.health + health;
    if (this.player.health > this.player.maxHealth) {
      this.player.health = this.player.maxHealth;
    }
  }
}
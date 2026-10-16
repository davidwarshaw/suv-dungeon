export default class SnakeEnemy {
  constructor(scene, points, key, numberSegments) {
    this.scene = scene;
    this.key = key;
    this.numberSegments = numberSegments;

    this.internal = {};
    this.internal.x = x;
    this.internal.y = y;
    this.internal.rotation = 0;
    this.internal.direction = "right";

    this.segments = points.map((point, i) => {
      const { x, y } = point;
      const frame = i === 0 ? 0 : 1;
      const sprite = scene.add.sprite(scene, x, y, "enemy-snake", frame);
      return { sprite };
    });
  }

  // Getters and Setters
  get x() {
    return this.internal.x;
  }

  get y() {
    return this.internal.y;
  }

  get rotation() {
    return this.internal.rotation;
  }

  get direction() {
    return this.internal.direction;
  }

  set x(x) {
    this.internal.x = x;
    this.images.forEach((image) => (image.x = this.internal.x));
  }

  set y(y) {
    this.internal.y = y;
    this.images.forEach((image, i) => {
      image.y = this.getStackY(this.internal.y, i);
    });
  }

  set rotation(rotation) {
    this.internal.rotation = rotation;
    // console.log(`this.internal.rotation: ${this.internal.rotation}`);
    this.images.forEach((image) => (image.rotation = this.internal.rotation));
  }

  set direction(direction) {
    this.internal.direction = direction;
    this.rotation = TileMath.rotationFromDirection(direction);
  }
}

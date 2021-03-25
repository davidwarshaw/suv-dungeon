import properties from "../properties";

import TileMath from '../utils/TileMath';

export default class SpriteStack {
  constructor(scene, x, y, key) {
    this.scene = scene;
    this.key = key;

    this.setters = {};
    this.setters.x = x
    this.setters.y = y;
    this.setters.rotation = 0;
    this.setters.direction = 'right';

    this.texture = scene.textures.get(key);
    this.stackOffset = 1;
    // Why is this off by one?
    const numSlices = this.texture.frameTotal - 1;
    // console.log(`SpriteStack: slices: ${numSlices}`);

    this.images = [...Array(numSlices).keys()].map((i) => {
      const sliceNumber = numSlices - 1 - i;
      const adjustedY = this.getStackY(this.setters.y, i);
      // console.log(`SpriteStack: ${this.setters.x}, ${adjustedY}: key: ${key} sliceNumber: ${sliceNumber}`);
      const image = scene.add.image(this.setters.x, adjustedY, key, sliceNumber);
      
      // Origin is more towards the bottom of the sprite
      // image.setOrigin(0.5, 0.9);

      return image;
    })
    .filter(image => image);

    this.rotatesWhenTurning = true;

    this.isAlive = true;

  }

  // Getters and Setters
  get x() {
    return this.setters.x;
  }

  get y() {
    return this.setters.y;
  }

  get rotation() {
    return this.setters.rotation;
  }

  get direction() {
    return this.setters.direction;
  }

  set x(x) {
    this.setters.x = x;
    this.images.forEach(image => image.x = this.setters.x);
  }

  set y(y) {
    this.setters.y = y;
    this.images.forEach((image, i) => {
      image.y = this.getStackY(this.setters.y, i);
    });
  }

  set rotation(rotation) {
    this.setters.rotation = rotation;
    // console.log(`this.setters.rotation: ${this.setters.rotation}`);
    this.images.forEach(image => image.rotation = this.setters.rotation);
  }

  set direction(direction) {
    this.setters.direction = direction;
    this.rotation = TileMath.rotationFromDirection(direction);
  }


  getStackY(y, sliceNumber) {
    return y - (sliceNumber * this.stackOffset);
  }

  stopAnimation() {
    // Do nothing
  }
}
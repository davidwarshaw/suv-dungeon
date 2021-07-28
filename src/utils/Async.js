function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, duration);
  });
}

function tween(scene, config) {
  return new Promise((resolve) => {
    config.onComplete = resolve;
    scene.tweens.add(config);
  });
}

function pan(camera, target, duration) {
  return new Promise((resolve) => {
    const resolveOnComplete = (camera, progress, scrollX, scrollY) => {
      if (progress === 1) {
        resolve();
      }
    };
    camera.pan(target.x, target.y, duration, "Linear", false, resolveOnComplete);
  });
}

function sequentialize(sequence) {
  return sequence.reduce(
    (accumulator, current) => accumulator.then(() => current),
    Promise.resolve()
  );
}

function completeSpriteAnimation(sprite, animationKey) {
  return new Promise((resolve) => {
    sprite.play(animationKey, false);
    sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animationKey, () => resolve());
  });
}

export default {
  sleep,
  tween,
  pan,
  sequentialize,
  completeSpriteAnimation,
};

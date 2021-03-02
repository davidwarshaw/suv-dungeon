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

export default {
  sleep,
  tween,
};

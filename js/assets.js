(function () {
  const keyImagePath = (key) => `assets/keyInput/keyImage/qte.keyInput.keyImage.${key}.png`;
  const successPath = (index) => `assets/keyInput/keySuccess/qte.keyInput.keySuccess.${index}.png`;
  const failPath = (index) => `assets/keyInput/keyFail/qte.keyInput.keyFail.${index}.png`;
  const introPath = (index) => `assets/intro/qte.intro.${index}.png`;
  const loopPath = (index) => `assets/loop/qte.loop.${index}.png`;
  const endPath = (index) => `assets/end/qte.end.${index}.png`;

  const ASSETS = {
    base: "assets/base/qte.base.base.png",
    keyNow: "assets/keyInput/keyNow/qte.keyInput.keyNow.0.png",
    timer: {
      base: "assets/timer/qte.timer.base.png",
      gauge: "assets/timer/qte.timer.gauge.png",
      edge: "assets/timer/qte.timer.edge.png"
    },
    keyImages: {},
    successFrames: Array.from({ length: 14 }, (_, index) => successPath(index)),
    failFrames: Array.from({ length: 14 }, (_, index) => failPath(index)),
    introFrames: Array.from({ length: 26 }, (_, index) => introPath(index)),
    loopFrames: Array.from({ length: 16 }, (_, index) => loopPath(index)),
    endFrames: Array.from({ length: 19 }, (_, index) => endPath(index))
  };

  window.QTE_CONFIG.keys.forEach((key) => {
    ASSETS.keyImages[key] = keyImagePath(key);
  });

  function flattenAssetPaths() {
    return [
      ASSETS.base,
      ASSETS.keyNow,
      ASSETS.timer.base,
      ASSETS.timer.gauge,
      ASSETS.timer.edge,
      ...Object.values(ASSETS.keyImages),
      ...ASSETS.successFrames,
      ...ASSETS.failFrames,
      ...ASSETS.introFrames,
      ...ASSETS.loopFrames,
      ...ASSETS.endFrames
    ];
  }

  function preloadImages(paths) {
    return Promise.all(paths.map((src) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ src, ok: true });
      image.onerror = () => resolve({ src, ok: false });
      image.src = src;
    })));
  }

  window.QTE_ASSETS = ASSETS;
  window.QTE_PRELOAD_IMAGES = () => preloadImages(flattenAssetPaths());
})();

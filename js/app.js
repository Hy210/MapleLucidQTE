(function () {
  const game = window.QTE_GAME;
  const renderer = window.QTE_RENDERER;
  const input = window.QTE_INPUT;

  function tick(now) {
    game.update(now);
    renderer.render(now);
    requestAnimationFrame(tick);
  }

  async function boot() {
    renderer.init();
    input.bind();
    renderer.render(performance.now());
    await window.QTE_PRELOAD_IMAGES();
    requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

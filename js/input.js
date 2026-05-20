(function () {
  const config = window.QTE_CONFIG;
  const game = window.QTE_GAME;

  function normalizeKey(eventKey) {
    if (!eventKey) {
      return null;
    }

    return config.keyMap[eventKey.toLowerCase()] || config.keyMap[eventKey] || null;
  }

  function handleKeydown(event) {
    const now = performance.now();

    if (event.key === config.stopKey) {
      event.preventDefault();
      game.stop();
      return;
    }

    if (event.key === config.startKey) {
      event.preventDefault();
      if (game.state.status !== "running") {
        game.start(now);
      }
      return;
    }

    const normalized = normalizeKey(event.key);
    if (!normalized) {
      return;
    }

    event.preventDefault();
    game.submitKey(normalized, now);
  }

  window.QTE_INPUT = {
    bind() {
      window.addEventListener("keydown", handleKeydown);
    }
  };
})();

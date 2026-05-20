(function () {
  const config = window.QTE_CONFIG;

  function createInitialState() {
    return {
      status: "idle",
      roundIndex: 0,
      roundStartTime: 0,
      sessionStartTime: 0,
      endEffectStartTime: 0,
      pattern: [],
      keyStates: [],
      totals: {
        correct: 0,
        wrong: 0,
        missed: 0,
        inputs: 0,
        roundsCompleted: 0
      },
      roundHistory: []
    };
  }

  const state = createInitialState();

  function resetTotals() {
    state.totals.correct = 0;
    state.totals.wrong = 0;
    state.totals.missed = 0;
    state.totals.inputs = 0;
    state.totals.roundsCompleted = 0;
    state.roundHistory = [];
  }

  function createPattern() {
    return Array.from({ length: config.patternLength }, () => {
      const index = Math.floor(Math.random() * config.keys.length);
      return config.keys[index];
    });
  }

  function createKeyStates(pattern) {
    return pattern.map((key) => ({
      key,
      state: "idle",
      resultAt: null
    }));
  }

  function beginRound(now) {
    state.pattern = createPattern();
    state.keyStates = createKeyStates(state.pattern);
    state.currentIndex = 0;
    state.roundStartTime = now;
    state.status = "running";
  }

  function start(now) {
    resetTotals();
    state.roundIndex = 0;
    state.sessionStartTime = now;
    state.endEffectStartTime = 0;
    beginRound(now);
  }

  function stop() {
    if (state.status === "running") {
      addMissedForCurrentRound();
    }
    state.endEffectStartTime = performance.now();
    state.status = "stopped";
  }

  function addMissedForCurrentRound() {
    let missed = 0;
    state.keyStates.forEach((keyState) => {
      if (keyState.state === "idle") {
        keyState.state = "missed";
        missed += 1;
      }
    });
    state.totals.missed += missed;
    return missed;
  }

  function finishRound(now) {
    const missed = addMissedForCurrentRound();
    state.totals.roundsCompleted += 1;
    state.roundHistory.push({
      round: state.roundIndex + 1,
      pattern: state.pattern.join(""),
      missed
    });

    state.roundIndex += 1;
    if (state.roundIndex >= config.roundCount) {
      state.endEffectStartTime = now;
      state.status = "finished";
      return;
    }

    beginRound(now);
  }

  function update(now) {
    if (state.status !== "running") {
      return;
    }

    const elapsed = now - state.roundStartTime;
    if (elapsed >= config.roundDurationMs) {
      finishRound(now);
    }
  }

  function submitKey(key, now) {
    if (state.status !== "running") {
      return;
    }

    if (state.currentIndex >= state.pattern.length) {
      return;
    }

    const expected = state.pattern[state.currentIndex];
    const keyState = state.keyStates[state.currentIndex];
    const isCorrect = key === expected;

    keyState.state = isCorrect ? "success" : "fail";
    keyState.resultAt = now;

    if (isCorrect) {
      state.totals.correct += 1;
    } else {
      state.totals.wrong += 1;
    }

    state.totals.inputs += 1;
    state.currentIndex += 1;
  }

  function getRoundProgress(now) {
    if (state.status !== "running") {
      return 0;
    }

    const elapsed = now - state.roundStartTime;
    return Math.max(0, Math.min(1, elapsed / config.roundDurationMs));
  }

  window.QTE_GAME = {
    state,
    start,
    stop,
    update,
    submitKey,
    getRoundProgress
  };
})();

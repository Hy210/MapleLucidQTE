(function () {
  const config = window.QTE_CONFIG;
  const assets = window.QTE_ASSETS;
  const game = window.QTE_GAME;

  const dom = {};

  function initRenderer() {
    dom.sceneEffect = document.getElementById("sceneEffect");
    dom.qtePanel = document.getElementById("qtePanel");
    dom.keyRow = document.getElementById("keyRow");
    dom.timerGaugeClip = document.getElementById("timerGaugeClip");
    dom.timerEdge = document.getElementById("timerEdge");
    dom.statusMain = document.getElementById("statusMain");
    dom.statusSub = document.getElementById("statusSub");
    dom.roundStat = document.getElementById("roundStat");
    dom.correctStat = document.getElementById("correctStat");
    dom.wrongStat = document.getElementById("wrongStat");
    dom.missedStat = document.getElementById("missedStat");
  }

  function getFrame(frames, resultAt, now) {
    const elapsed = Math.max(0, now - resultAt);
    const frameMs = 1000 / config.resultAnimationFps;
    const index = Math.floor(elapsed / frameMs);
    if (index >= frames.length) {
      return null;
    }
    return frames[Math.min(index, frames.length - 1)];
  }

  function renderEffect(now) {
    const state = game.state;

    if (state.status === "running") {
      const introFrameMs = 1000 / config.effectIntroFps;
      const introIndex = Math.floor((now - state.sessionStartTime) / introFrameMs);
      if (introIndex >= 0 && introIndex < assets.introFrames.length) {
        dom.sceneEffect.src = assets.introFrames[introIndex];
        return;
      }

      const loopFrameMs = 1000 / config.effectLoopFps;
      const loopStart = state.sessionStartTime + assets.introFrames.length * introFrameMs;
      const loopIndex = Math.floor((now - loopStart) / loopFrameMs) % assets.loopFrames.length;
      dom.sceneEffect.src = assets.loopFrames[Math.max(0, loopIndex)];
      return;
    }

    if ((state.status === "finished" || state.status === "stopped") && state.endEffectStartTime > 0) {
      const endFrameMs = 1000 / config.effectEndFps;
      const endIndex = Math.floor((now - state.endEffectStartTime) / endFrameMs);
      dom.sceneEffect.src = assets.endFrames[Math.min(Math.max(0, endIndex), assets.endFrames.length - 1)];
      return;
    }

    const idleFrameMs = 1000 / config.effectLoopFps;
    const idleIndex = Math.floor(now / idleFrameMs) % assets.loopFrames.length;
    dom.sceneEffect.src = assets.loopFrames[idleIndex];
  }

  function renderKeys(now) {
    const state = game.state;
    dom.keyRow.innerHTML = "";

    state.keyStates.forEach((keyState, index) => {
      const slot = document.createElement("div");
      slot.className = "key-slot";

      if (state.status === "running" && index === state.currentIndex) {
        const arrow = document.createElement("img");
        arrow.className = "current-arrow";
        arrow.src = assets.keyNow;
        arrow.alt = "";
        slot.appendChild(arrow);
      }

      if (keyState.state === "success") {
        const frame = getFrame(assets.successFrames, keyState.resultAt, now);
        const image = document.createElement("img");
        image.className = "result-image";
        if (!frame) {
          dom.keyRow.appendChild(slot);
          return;
        }
        image.src = frame;
        image.alt = "";
        slot.appendChild(image);
      } else if (keyState.state === "fail") {
        const frame = getFrame(assets.failFrames, keyState.resultAt, now);
        const image = document.createElement("img");
        image.className = "result-image";
        if (!frame) {
          dom.keyRow.appendChild(slot);
          return;
        }
        image.src = frame;
        image.alt = "";
        slot.appendChild(image);
      } else if (keyState.state === "idle") {
        const image = document.createElement("img");
        image.className = "key-image";
        image.src = assets.keyImages[keyState.key];
        image.alt = keyState.key;
        slot.appendChild(image);
      }

      dom.keyRow.appendChild(slot);
    });
  }

  function renderTimer(now) {
    const ratio = game.getRoundProgress(now);
    const fillWidth = Math.max(0, Math.round(config.timerFillWidth * ratio));
    dom.timerGaugeClip.style.left = "12px";
    dom.timerGaugeClip.style.width = `${fillWidth}px`;
    dom.timerEdge.style.left = `${8 + fillWidth}px`;
  }

  function renderStatus() {
    const state = game.state;
    const shownRound = state.status === "idle" ? 0 : Math.min(state.roundIndex + 1, config.roundCount);
    dom.roundStat.textContent = `${shownRound} / ${config.roundCount}`;
    dom.correctStat.textContent = String(state.totals.correct);
    dom.wrongStat.textContent = String(state.totals.wrong);
    dom.missedStat.textContent = String(state.totals.missed);

    if (state.status === "idle") {
      dom.statusMain.textContent = "Enter";
      dom.statusSub.textContent = "\uc2dc\uc791 / \uc7ac\uc2dc\uc791";
    } else if (state.status === "running") {
      dom.statusMain.textContent = state.currentIndex >= state.pattern.length ? "\ub300\uae30 \uc911" : state.pattern[state.currentIndex];
      dom.statusSub.textContent = "Esc \uc911\ub2e8";
    } else if (state.status === "stopped") {
      dom.statusMain.textContent = "\uc911\ub2e8\ub428";
      dom.statusSub.textContent = "Enter \uc7ac\uc2dc\uc791";
    } else if (state.status === "finished") {
      const total = state.totals.correct + state.totals.wrong + state.totals.missed;
      const accuracy = total === 0 ? 0 : Math.round((state.totals.correct / total) * 100);
      dom.statusMain.textContent = `\uc644\ub8cc ${accuracy}%`;
      dom.statusSub.textContent = "Enter \uc7ac\uc2dc\uc791";
    }
  }

  function render(now) {
    const state = game.state;
    renderEffect(now);
    dom.qtePanel.classList.toggle("is-visible", state.status === "running");

    if (state.status !== "running") {
      dom.keyRow.innerHTML = "";
      dom.timerGaugeClip.style.left = "12px";
      dom.timerGaugeClip.style.width = "0px";
      dom.timerEdge.style.left = "8px";
    } else {
      renderKeys(now);
      renderTimer(now);
    }

    renderStatus();
  }

  window.QTE_RENDERER = {
    init: initRenderer,
    render
  };
})();

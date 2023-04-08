app.screen.gameOver = app.screenManager.invent({
  // Attributes
  id: 'gameOver',
  parentSelector: '.a-app--gameOver',
  rootSelector: '.a-gameOver',
  transitions: {
    continue: function () {
      engine.state.reset()
      this.change('mainMenu')
    },
  },
  // State
  state: {},
  // Hooks
  onEnter: function () {
    const highscore = app.storage.highscore.get(),
      score = content.score.value()

    const isHighscore = score > highscore

    this.rootElement.querySelector('.a-gameOver--isHighscore').hidden = !isHighscore
    this.rootElement.querySelector('.a-gameOver--scoreValue').innerHTML = score

    if (isHighscore) {
      app.storage.highscore.set(score)
    }

    this.state.resetTimer = engine.time(1)
  },
  onFrame: function () {
    const ui = app.controls.ui()

    if (ui.action || ui.tab || ui.focus === 0) {
      app.screenManager.dispatch('continue')
    }

    // Reset state after screen transition 🤷‍♀️
    if (this.state.resetTimer && this.state.resetTimer < engine.time()) {
      engine.state.reset()
      delete this.state.resetTimer
    }
  },
})

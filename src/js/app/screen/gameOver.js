app.screen.gameOver = app.screenManager.invent({
  // Attributes
  id: 'gameOver',
  parentSelector: '.a-app--gameOver',
  rootSelector: '.a-gameOver',
  transitions: {
    continue: function () {
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

    this.rootElement.querySelector('.a-gameOver--highscore').hidden = isHighscore
    this.rootElement.querySelector('.a-gameOver--highscoreValue').innerHTML = highscore + 1
    this.rootElement.querySelector('.a-gameOver--isHighscore').hidden = !isHighscore
    this.rootElement.querySelector('.a-gameOver--scoreValue').innerHTML = score

    if (isHighscore) {
      app.storage.highscore.set(score)
    }
  },
  onFrame: function () {
    const ui = app.controls.ui()

    if (ui.action || ui.focus === 0) {
      app.screenManager.dispatch('continue')
    }
  },
})

app.screen.mainMenu = app.screenManager.invent({
  // Attributes
  id: 'mainMenu',
  parentSelector: '.a-app--mainMenu',
  rootSelector: '.a-mainMenu',
  transitions: {
    back: function () {
      this.change('splash')
    },
    continue: function () {
      app.storage.game.load()
      this.change('game')
    },
    newGame: function () {
      // Save existing high score 🤷‍♀️
      app.storage.highscore.update()

      // Initialize game state 🤷‍♀️
      engine.state.import({
        monster: {
          position: {
            z: -content.monster.dangerDistance(),
          },
        },
        seed: engine.fn.randomInt(11111111111, 99999999999),
      })

      this.change('game')
    },
    quit: function () {
      app.quit()
    },
  },
  // State
  state: {},
  // Hooks
  onReady: function () {
    const root = this.rootElement

    Object.entries({
      continue: root.querySelector('.a-mainMenu--continue'),
      newGame: root.querySelector('.a-mainMenu--newGame'),
      quit: root.querySelector('.a-mainMenu--quit'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })

    root.querySelector('.a-mainMenu--action-quit').hidden = !app.isElectron()
  },
  onEnter: function () {
    this.rootElement.querySelector('.a-mainMenu--action-continue').hidden = !app.storage.game.has()
    this.updateScores()

    this.state.resetTimer = engine.time(1)

    // Read scores to screen readers on button hover
    this.rootElement.querySelector('.a-mainMenu--continue').setAttribute('aria-describedby', 'a-mainMenu--continueDescription')
    this.rootElement.querySelector('.a-mainMenu--newGame').setAttribute('aria-describedby', 'a-mainMenu--newGameDescription')
  },
  onExit: function () {
    // Prevent reading aloud on click
    this.rootElement.querySelector('.a-mainMenu--continue').removeAttribute('aria-describedby')
    this.rootElement.querySelector('.a-mainMenu--newGame').removeAttribute('aria-describedby')
  },
  onFrame: function () {
    const root = this.rootElement,
      ui = app.controls.ui()

    if (ui.back) {
      app.screenManager.dispatch('back')
    }

    if (ui.confirm) {
      const focused = app.utility.focus.get(root)

      if (focused) {
        return focused.click()
      }
    }

    if ('focus' in ui) {
      const toFocus = app.utility.focus.selectFocusable(root)[ui.focus]

      if (toFocus) {
        if (app.utility.focus.is(toFocus)) {
          return toFocus.click()
        }

        return app.utility.focus.set(toFocus)
      }
    }

    if (ui.up) {
      return app.utility.focus.setPreviousFocusable(root)
    }

    if (ui.down) {
      return app.utility.focus.setNextFocusable(root)
    }

    // Reset state after screen transition 🤷‍♀️
    if (this.state.resetTimer && this.state.resetTimer < engine.time()) {
      engine.state.reset()
      delete this.state.resetTimer
    }
  },
  updateScores: function () {
    const highscore = app.storage.highscore.get(),
      score = content.score.value()

    const isHighscore = score > highscore

    this.rootElement.querySelector('.a-mainMenu--highscore').hidden = isHighscore
    this.rootElement.querySelector('.a-mainMenu--highscoreValue').innerHTML = highscore + 1
    this.rootElement.querySelector('.a-mainMenu--isHighscore').hidden = !isHighscore
    this.rootElement.querySelector('.a-mainMenu--scoreValue').innerHTML = score

    return this
  },
})

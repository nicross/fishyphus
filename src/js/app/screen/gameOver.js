app.screen.gameOver = app.screenManager.invent({
  // Attributes
  id: 'gameOver',
  parentSelector: '.a-app--gameOver',
  rootSelector: '.a-gameOver',
  transitions: {
    mainMenu: function () {
      engine.state.reset()
      this.change('mainMenu')
    },
  },
  // State
  state: {},
  // Hooks
  onReady: function () {
    const root = this.rootElement

    Object.entries({
      mainMenu: root.querySelector('.a-gameOver--mainMenu'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })
  },
  onEnter: function () {
    const highscore = app.storage.highscore.get(),
      score = content.score.value()

    const isHighscore = score > highscore

    this.rootElement.querySelector('.a-gameOver--isHighscore').hidden = !isHighscore
    this.rootElement.querySelector('.a-gameOver--scoreValue').innerHTML = score

    if (isHighscore) {
      app.storage.highscore.set(score)
    }

    this.state.confirmTimer = engine.time(1)
  },
  onFrame: function () {
    const root = this.rootElement,
      ui = app.controls.ui()

    if (ui.confirm) {
      // Allow confirm on any element to advance to next screen
      // Use a timer to prevent flashes if death occurs during button mashing
      if (engine.time() > this.state.confirmTimer) {
        return app.screenManager.dispatch('mainMenu')
      }

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
  },
})

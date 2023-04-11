app.screen.newGame = app.screenManager.invent({
  // Attributes
  id: 'newGame',
  parentSelector: '.a-app--newGame',
  rootSelector: '.a-newGame',
  transitions: {
    back: function () {
      this.change('mainMenu')
    },
    confirm: function () {
      if (app.screen.tutorial.hasInfo()) {
        this.change('tutorial')
      } else {
        app.storage.game.new()
        this.change('game')
      }
    },
  },
  // State
  state: {},
  // Hooks
  onReady: function () {
    const root = this.rootElement

    Object.entries({
      back: root.querySelector('.a-newGame--back'),
      confirm: root.querySelector('.a-newGame--confirm'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })
  },
  onEnter: function () {
    const highscore = app.storage.highscore.get(),
      score = content.score.value() || app.storage.game.get()?.score || 0

    const isHighscore = score > highscore

    this.rootElement.querySelector('.a-newGame--isHighscore').hidden = !isHighscore
    this.rootElement.querySelector('.a-newGame--scoreValue').innerHTML = score

    // Read scores to screen readers on button focus
    this.rootElement.querySelector('.a-newGame--back').setAttribute('aria-describedby', 'a-newGame--backDescription')
  },
  onExit: function () {
    this.rootElement.querySelector('.a-newGame--back').removeAttribute('aria-describedby')
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
  },
})

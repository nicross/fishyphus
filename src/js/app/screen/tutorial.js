app.screen.tutorial = app.screenManager.invent({
  // Attributes
  id: 'tutorial',
  parentSelector: '.a-app--tutorial',
  rootSelector: '.a-tutorial',
  transitions: {
    newGame: function () {
      app.storage.game.new()
      this.change('game')
    },
  },
  // State
  state: {},
  // Hooks
  onReady: function () {
    const root = this.rootElement

    Object.entries({
      newGame: root.querySelector('.a-tutorial--newGame'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })
  },
  onEnter: function () {
    this.rootElement.querySelector('.a-tutorial--text').innerHTML = this.getInfo()
  },
  onFrame: function () {
    const root = this.rootElement,
      ui = app.controls.ui()

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
  // Methods
  getInfo: function () {
    const highscore = app.storage.highscore.get()

    if (highscore == 0) {
      return 'Press <kbd>Action</kbd> to cast, wait, reel, and catch your first fish.'
    }

    if (highscore == 1) {
      return 'Press <kbd>Accelerate</kbd>, <kbd>Brake</kbd>, and <kbd>Turn</kbd> to locate more fish.'
    }

    if (highscore <= 3) {
      return 'You feel yourself growing stronger with each expedition.'
    }
  },
  hasInfo: function () {
    return Boolean(this.getInfo())
  },
})

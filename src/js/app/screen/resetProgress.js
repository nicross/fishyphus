app.screen.resetProgress = app.screenManager.invent({
  // Attributes
  id: 'resetProgress',
  parentSelector: '.a-app--resetProgress',
  rootSelector: '.a-resetProgress',
  transitions: {
    back: function () {
      this.change('mainMenu')
    },
    confirm: function () {
      app.storage.game.clear()
      app.storage.highscore.clear()
      this.change('splash')
    },
  },
  // State
  state: {},
  // Hooks
  onReady: function () {
    const root = this.rootElement

    Object.entries({
      back: root.querySelector('.a-resetProgress--back'),
      confirm: root.querySelector('.a-resetProgress--confirm'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })
  },
  onEnter: function () {
    const highscore = app.storage.highscore.get()

    this.rootElement.querySelector('.a-resetProgress--back').setAttribute('aria-describedby', 'a-resetProgress--backDescription')
    this.rootElement.querySelector('.a-resetProgress--highscoreValue').innerHTML = highscore + 1
  },
  onExit: function () {
    // Read scores to screen readers on button focus
    this.rootElement.querySelector('.a-resetProgress--back').removeAttribute('aria-describedby')
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

app.screen.clearProgress = app.screenManager.invent({
  // Attributes
  id: 'clear',
  parentSelector: '.a-app--clear',
  rootSelector: '.a-clear',
  transitions: {
    back: function () {
      this.change('mainMenu')
    },
    confirm: function () {
      // Clear progress 🤷‍♀️
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
      back: root.querySelector('.a-clear--back'),
      confirm: root.querySelector('.a-clear--confirm'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.screenManager.dispatch(event))
    })
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

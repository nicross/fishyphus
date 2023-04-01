app.screen.mainMenu = app.screenManager.invent({
  // Attributes
  id: 'mainMenu',
  parentSelector: '.a-app--mainMenu',
  rootSelector: '.a-mainMenu',
  transitions: {
    continue: function () {
      app.storage.game.load()
      this.change('game')
    },
    newGame: function () {
      // Initialize game state 🤷‍♀️
      engine.state.import({
        monster: {
          position: {
            z: -content.monster.dangerDistance(),
          },
        },
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
    const root = this.rootElement

    root.querySelector('.a-mainMenu--action-continue').hidden = !app.storage.game.has()
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
  },
})

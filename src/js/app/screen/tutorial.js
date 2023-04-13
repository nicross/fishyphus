app.screen.tutorial = app.screenManager.invent({
  // Attributes
  id: 'tutorial',
  parentSelector: '.a-app--tutorial',
  rootSelector: '.a-tutorial',
  transitions: {
    newGame: function () {
      app.storage.tutorial.add(app.screen.tutorial.state.activeTutorial.id)
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
    this.state.activeTutorial = this.chooseTutorial()
    this.rootElement.querySelector('.a-tutorial--text').innerHTML = this.state.activeTutorial.text
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
  // Tutorials
  tutorials: [
    {
      id: 'welcome',
      text: 'Press <kbd>Action</kbd> to cast, wait, reel, and catch your first fish.',
      criteria: () => app.storage.highscore.get() == 0,
    },
    {
      id: 'basics',
      text: 'Press <kbd>Accelerate</kbd>, <kbd>Brake</kbd>, and <kbd>Turn</kbd> to locate more fish.',
      criteria: () => app.storage.highscore.get() == 1,
    },
    {
      id: 'fish',
      text: 'Fish swim closer to the surface as your ship nears.',
      criteria: function () {
        return app.storage.tutorial.has('basics') && !app.storage.tutorial.has(this.id)
      },
    },
    {
      id: 'timing',
      text: 'Fishing rewards quick reactions to its timely cues.',
      criteria: function () {
        return app.storage.tutorial.has('basics') && !app.storage.tutorial.has(this.id)
      },
    },
    {
      id: 'reeling',
      text: 'Press <kbd>Action</kbd> repeatedly while reeling to increase its speed.',
      criteria: function () {
        return app.storage.tutorial.has('basics') && !app.storage.tutorial.has(this.id)
      },
    },
    {
      id: 'canceling',
      text: 'Press <kbd>Action</kbd> while waiting to cancel a fishing attempt.',
      criteria: function () {
        return app.storage.tutorial.has('basics') && !app.storage.tutorial.has(this.id)
      },
    },
    {
      id: 'death',
      text: 'Death is a trivial recurrence from which you grow stronger.',
      criteria: function () {
        return app.storage.tutorial.has('basics') && !app.storage.tutorial.has(this.id)
      },
    },
    {
      id: 'rush',
      text: 'The reaper moves faster while actively fishing.',
      criteria: function () {
        return app.storage.tutorial.has('basics') && !app.storage.tutorial.has(this.id)
      },
    },
    {
      id: 'stun',
      text: 'The reaper becomes stunned when fish are caught.',
      criteria: function () {
        return app.storage.tutorial.has('basics') && !app.storage.tutorial.has(this.id)
      },
    },
    {
      id: 'looking',
      text: 'You may look freely in any direction while moving.',
      criteria: function () {
        return app.storage.tutorial.has('basics') && !app.storage.tutorial.has(this.id)
      },
    },
    {
      id: 'moving',
      text: 'Your ship moves at a constant velocity once accelerated.',
      criteria: function () {
        return app.storage.tutorial.has('basics') && !app.storage.tutorial.has(this.id)
      },
    },
    {
      id: 'turning',
      text: 'Your ship changes direction faster at slower speeds.',
      criteria: function () {
        return app.storage.tutorial.has('basics') && !app.storage.tutorial.has(this.id)
      },
    },
    {
      id: 'weight',
      text: 'Your ship moves slower as more fish are caught.',
      criteria: function () {
        return app.storage.tutorial.has('basics') && !app.storage.tutorial.has(this.id)
      },
    },
  ],
  // Methods
  chooseTutorial: function () {
    const available = this.tutorials.filter(
      (tutorial) => tutorial.criteria()
    )

    return engine.fn.choose(available, Math.random())
  },
  hasTutorial: function () {
    return this.tutorials.some(
      (tutorial) => tutorial.criteria()
    )
  },
})

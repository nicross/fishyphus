app.screen.tutorial = app.screenManager.invent({
  // Attributes
  id: 'tutorial',
  parentSelector: '.a-app--tutorial',
  rootSelector: '.a-tutorial',
  transitions: {
    back: function () {
      this.change('mainMenu')
    },
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
      back: root.querySelector('.a-tutorial--back'),
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

    // Allow confirm on any element to advance to next screen
    if (ui.confirm) {
      return app.screenManager.dispatch('newGame')
    }

    // Handle role=button on the description
    if (ui.enter || ui.space) {
      const focused = app.utility.focus.get(root)

      if (focused && focused.tagName != 'button' && focused.role == 'button') {
        return app.screenManager.dispatch('newGame')
      }
    }

    if (ui.back) {
      return app.screenManager.dispatch('back')
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
  // Tutorials
  tutorials: [
    {
      id: 'welcome',
      text: 'Press <kbd>Action</kbd> to cast, wait, reel, and catch your first fish. Receive bonuses to waiting time and reeling speed with good reaction times. Mash it repeatedly while reeling to increase its speed.',
      criteria: function () {
        return content.score.value() == 0
      },
    },
    {
      id: 'basics',
      text: 'Press <kbd>Turn</kbd> to scan the area for more fish, <kbd>Accelerate</kbd> to apply thrust in the direction faced, and <kbd>Brake</kbd> to slow down. Your ship moves in the same direction until force is applied.',
      criteria: function () {
        return app.storage.tutorial.has('welcome') && !app.storage.tutorial.has(this.id)
      },
    },
    {
      id: 'reaper',
      text: 'Death is inevitable. Although the reaper is always near, it can be outmaneuvered at short distances. While fishing, it\'s attracted to your lure and hastens its chase. However, it becomes stunned for a short time whenever fish are caught.',
      criteria: function () {
        return app.storage.tutorial.has('basics') && !app.storage.tutorial.has(this.id)
      },
    },
    {
      id: 'goodbye',
      text: 'You have learned everything to be successful. Catch fish expertly with precision to grow stronger against the reaper. Or reset your progress to be onboarded again. Good luck!',
      criteria: function () {
        return app.storage.tutorial.has('reaper') && !app.storage.tutorial.has(this.id)
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

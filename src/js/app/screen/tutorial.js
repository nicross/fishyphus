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
      text: 'Press <kbd>Action</kbd> to cast, wait, reel, and catch your first fish. Receive bonuses to waiting time and reeling speed with good reaction times. Mash repeatedly while reeling to increase its speed. The reaper awaits!',
      criteria: function () {
        return app.storage.highscore.get() == 0
      },
    },
    {
      id: 'movement',
      text: 'Press <kbd>Turn</kbd> to scan the area for fish, <kbd>Accelerate</kbd> to apply forward thrust, and <kbd>Brake</kbd> to slow down. Your ship moves constantly unless acted upon. Drop anchor at the center of fishing spots for best results.',
      criteria: function () {
        return app.storage.highscore.get() >= 1 && app.storage.tutorial.has('welcome') && !app.storage.tutorial.has('reaper')
      },
    },
    {
      id: 'reaper',
      text: 'Although the reaper is inevitable, it can be outmaneuvered at short distances, and becomes stunned whenever fish are caught. However, its pace quickens while fishing and carrying larger quantities of fish.',
      criteria: function () {
        return app.storage.highscore.get() >= 2 && app.storage.tutorial.has('movement') && !app.storage.tutorial.has('goodbye')
      },
    },
    {
      id: 'goodbye',
      text: 'You have learned everything to be successful. Catch fish expertly with precision to grow stronger against the reaper. Or reset your progress to be onboarded again. Safe travels!',
      criteria: function () {
        return app.storage.highscore.get() >= 3 && app.storage.tutorial.has('reaper') && !app.storage.tutorial.has('goodbye')
      },
    },
  ],
  // Methods
  chooseTutorial: function () {
    const available = this.tutorials.filter(
      (tutorial) => tutorial.criteria()
    )

    return available.pop()
  },
  hasTutorial: function () {
    return this.tutorials.some(
      (tutorial) => tutorial.criteria()
    )
  },
})

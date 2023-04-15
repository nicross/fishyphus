app.screen.splash = app.screenManager.invent({
  // Attributes
  id: 'splash',
  parentSelector: '.a-app--splash',
  rootSelector: '.a-splash',
  transitions: {
    continue: function () {
      this.change('mainMenu')
    },
  },
  // State
  state: {},
  // Hooks
  onReady: function () {
    const root = this.rootElement

    root.addEventListener('click', () => {
      app.screenManager.dispatch('continue')
    })

    root.querySelector('.a-splash--version').innerHTML = `v${app.version()}`
  },
  onFrame: function () {
    const ui = app.controls.ui()

    if (ui.action || ui.tab || ui.focus === 0) {
      app.screenManager.dispatch('continue')
    }
  },
})

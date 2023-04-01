app.screen.game = app.screenManager.invent({
  // Attributes
  id: 'game',
  parentSelector: '.a-app--game',
  rootSelector: '.a-game',
  transitions: {
    pause: function () {
      console.log('pause')
    },
  },
  // State
  state: {},
  // Hooks
  onReady: function () {
    this.score.ready()
  },
  onEnter: function () {
    this.score.enter()
  },
  onExit: function () {
    this.score.exit()
  },
  onFrame: function () {
    const game = app.controls.game(),
      ui = app.controls.ui()

    if (ui.pause) {
      app.screenManager.dispatch('pause')
    }

    content.movement.update(game)
    this.score.update()
  },
})

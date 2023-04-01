app.screen.game = app.screenManager.invent({
  // Attributes
  id: 'game',
  parentSelector: '.a-app--game',
  rootSelector: '.a-game',
  transitions: {},
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
    this.score.update()
  },
})

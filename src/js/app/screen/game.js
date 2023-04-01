app.screen.game = app.screenManager.invent({
  // Attributes
  id: 'game',
  parentSelector: '.a-app--game',
  rootSelector: '.a-game',
  transitions: {
    kill: function () {
      app.storage.game.clear()
      this.change('gameOver')
    },
    pause: function () {
      app.storage.game.save()
      this.change('mainMenu')
    },
  },
  // State
  state: {},
  // Hooks
  onReady: function () {
    this.score.ready()
  },
  onEnter: function () {
    // Resume
    engine.loop.resume()

    // Anything else
    this.score.enter()
  },
  onExit: function () {
    engine.loop.pause()

    this.score.exit()
  },
  onFrame: function () {
    const game = app.controls.game(),
      ui = app.controls.ui()

    if (ui.pause) {
      return app.screenManager.dispatch('pause')
    }

    content.movement.update(game)
    this.score.update()

    // Handle monster
    content.monster.update()

    if (content.monster.isKill()) {
      return app.screenManager.dispatch('kill')
    }
  },
})

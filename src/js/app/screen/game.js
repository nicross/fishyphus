app.screen.game = app.screenManager.invent({
  // Attributes
  id: 'game',
  parentSelector: '.a-app--game',
  rootSelector: '.a-game',
  transitions: {
    end: function () {
      console.log('end')
    },
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
    // Start new game
    engine.state.import({
      monster: {
        position: {
          z: -content.monster.normalVelocity() * 60,
        },
      },
    })

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
      app.screenManager.dispatch('pause')
    }

    content.movement.update(game)
    this.score.update()

    // Handle monster
    content.monster.update()

    if (content.monster.isKill()) {
      app.screenManager.dispatch('end')
    }
  },
})

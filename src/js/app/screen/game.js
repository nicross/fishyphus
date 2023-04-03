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
    this.toasts.ready()
  },
  onEnter: function () {
    // Resume
    content.audio.unduck()
    engine.loop.resume()

    this.toasts.enter()
  },
  onExit: function () {
    content.audio.duck()
    engine.loop.pause()

    this.toasts.exit()
  },
  onReset: function () {
    this.toasts.reset()
  },
  onFrame: function () {
    const game = app.controls.game(),
      ui = app.controls.ui()

    if (ui.pause) {
      return app.screenManager.dispatch('pause')
    }

    if (ui.action) {
      content.minigame.action()
    }

    if (!content.minigame.isActive()) {
      content.movement.update(game)
    }

    this.toasts.update()

    // Handle monster
    content.monster.update()

    if (content.monster.isKill()) {
      return app.screenManager.dispatch('kill')
    }
  },
})

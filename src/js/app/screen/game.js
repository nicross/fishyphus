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
    this.status.ready()
    this.toasts.ready()
  },
  onEnter: function () {
    // Resume
    content.audio.unduck()
    engine.loop.resume()

    this.toasts.enter()
  },
  onExit: async function () {
    content.audio.duck()
    engine.loop.pause()

    this.toasts.exit()

    await engine.fn.promise(500)
    content.gl.clear()
  },
  onReset: function () {
    this.status.reset()
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

    content.movement.update(game)
    content.monster.update()

    this.status.update()
    this.toasts.update()
  },
})

// Handle kill 🤷‍♀️
content.monster.on('kill', () => app.screenManager.dispatch('kill'))

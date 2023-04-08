app.storage.game = {
  clear: () => app.storage.clear('game'),
  has: () => app.storage.has('game'),
  get: () => app.storage.get('game'),
  set: (value) => app.storage.set('game', value),
  // Helpers
  new: function () {
    engine.state.import({
      bonus: app.storage.highscore.get(),
      seed: engine.fn.randomInt(11111111111, 99999999999),
    })

    return this
  },
  load: function () {
    engine.state.import(
      this.get()
    )

    return this
  },
  save: function () {
    this.set(
      engine.state.export()
    )

    return this
  },
}

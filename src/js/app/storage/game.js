app.storage.game = {
  clear: () => app.storage.clear('game'),
  has: () => app.storage.has('game'),
  get: () => app.storage.get('game'),
  set: (value) => app.storage.set('game', value),
  // Helpers
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

app.updates.register('1.0.0', () => {
  clearAll()

  function clearAll() {
    app.storage.game.clear()
    app.storage.highscore.clear()
    app.storage.tutorial.clear()
  }
})

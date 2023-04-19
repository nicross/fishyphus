app.updates.register('1.0.0', () => {
  clearHighscore()

  function clearHighscore() {
    app.storage.highscore.clear()
  }
})

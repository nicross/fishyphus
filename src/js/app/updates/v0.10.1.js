app.updates.register('0.10.1', () => {
  migrateTutorial()

  function migrateTutorial() {
    const highscore = app.storage.highscore.get()

    if (highscore > 0) {
      app.storage.tutorial.add('welcome')
    }

    if (highscore > 1) {
      app.storage.tutorial.add('basics')
    }
  }
})

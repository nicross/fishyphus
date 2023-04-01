app.storage.highscore = {
  has: function () {
    return this.get() > 0
  },
  get: () => {
    const value = app.storage.get('highscore')

    return Number(value) || 0
  },
  set: function (value) {
    app.storage.set('highscore', Number(value) || 0)

    return this
  },
  // Helpers
  update: function () {
    const highscore = this.get(),
      score = content.score.value()

    if (score > highscore) {
      this.set(score)
    }

    return this
  },
}

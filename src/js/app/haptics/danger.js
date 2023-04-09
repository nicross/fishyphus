app.haptics.danger = {
  update: (delta) => {
    if (content.monster.isStunned()) {
      return
    }

    const value = engine.fn.scale(
      content.monster.dangerCountdown(),
      10, 0,
      0, 1
    )

    if (value < 0) {
      return
    }

    app.haptics.enqueue({
      duration: delta,
      startDelay: 0,
      strongMagnitude: value ** 10,
      weakMagnitude: value ** 5,
    })

    return this
  },
}

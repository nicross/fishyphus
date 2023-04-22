app.haptics.acceleration = {
  update: (delta) => {
    const value = content.audio.acceleration.value()

    if (value <= 0) {
      return
    }

    app.haptics.enqueue({
      duration: delta,
      startDelay: 0,
      strongMagnitude: 0,
      weakMagnitude: 0.25 * Math.max(0.1, value) * engine.fn.lerp(0.25 + (Math.random() *0.75), 1, value),
    })

    return this
  },
}

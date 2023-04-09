app.haptics.fish = (() => {
  let timeout = 0

  return {
    update: (delta) => {
      if (timeout > engine.time()) {
        return
      }

      const closest = content.fish.closest(),
        isMinigameActive = content.minigame.isActive()

      if (!closest || isMinigameActive) {
        return
      }

      const duration = engine.fn.lerp(1000, 500, closest.value)

      app.haptics.enqueue({
        duration: duration * 0.5,
        startDelay: 0,
        strongMagnitude: 0,
        weakMagnitude: closest.value ** 2,
      })

      timeout = engine.time(duration / 1000)

      return this
    },
  }
})()

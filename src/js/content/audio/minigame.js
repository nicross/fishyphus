content.audio.minigame = (() => {
  const bus = content.audio.createBus()

  return {
    bus: () => bus,
    reset: function () {
      this.castingAlert.reset()
      this.waitingAlert.reset()

      return this
    },
    update: function () {
      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.minigame.update()
})

engine.state.on('reset', () => content.audio.minigame.reset())

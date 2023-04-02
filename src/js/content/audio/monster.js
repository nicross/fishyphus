content.audio.monster = (() => {
  const bus = content.audio.createBus()

  let isActive = false

  return {
    bus: () => bus,
    create: function () {
      if (isActive) {
        return this
      }

      this.sub.create()
      isActive = true

      return this
    },
    destroy: function () {
      if (!isActive) {
        return this
      }

      this.sub.destroy()
      isActive = false

      return this
    },
    update: function () {
      const value = content.monster.dangerValue()

      if (value) {
        if (isActive) {
          this.sub.update()
        } else {
          this.create()
        }
      } else if (isActive) {
        this.destroy()
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.monster.update()
})

engine.state.on('reset', () => content.audio.monster.destroy())

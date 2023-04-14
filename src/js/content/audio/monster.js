content.audio.monster = (() => {
  // Bypass the content.audio ducker to be audible on menus
  const bus = engine.mixer.createBus()

  bus.id = 'test'

  let isActive = false

  return {
    bus: () => bus,
    create: function () {
      if (isActive) {
        return this
      }

      this.pads.create()
      this.rumble.create()
      this.sub.create()

      isActive = true

      return this
    },
    destroy: function () {
      if (!isActive) {
        return this
      }

      this.pads.destroy()
      this.rumble.destroy()
      this.sub.destroy()

      isActive = false

      return this
    },
    update: function () {
      this.parameters.update()

      if (this.parameters.active()) {
        if (isActive) {
          this.pads.update()
          this.rumble.update()
          this.sub.update()
        } else {
          this.create()
        }
      } else if (isActive) {
        this.destroy()
      }

      engine.fn.setParam(bus.gain, this.parameters.mainGain())

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  content.audio.monster.update()
})

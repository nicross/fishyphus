content.audio = (() => {
  const bus = engine.mixer.createBus(),
    context= engine.context()

  bus.gain.value = engine.const.zeroGain

  return {
    buffer: {},
    bus: () => bus,
    createBus: () => {
      const input = context.createGain()
      input.connect(bus)

      return input
    },
    duck: function () {
      engine.fn.rampLinear(bus.gain, engine.const.zeroGain, 0.5)

      return this
    },
    unduck: function () {
      engine.fn.rampLinear(bus.gain, 1, 0.5)

      return this
    },
  }
})()

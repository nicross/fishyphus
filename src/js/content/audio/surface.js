content.audio.surface = (() => {
  const bus = content.audio.createBus()

  const filterModel = engine.ear.filterModel.musical.extend({
    frequency: 100,
    maxColor: 10,
    minColor: 1,
    power: 1,
  })

  const delay = engine.effect.pingPongDelay({
    dry: 1,
    duration: 1/4,
    wet: 1,
  })

  let binaural,
    synth

  delay.output.connect(bus)

  return {
    create: function () {
      synth = engine.synth.buffer({
        buffer: content.audio.buffer.brownNoise.get(1),
        gain: engine.fn.fromDb(-21),
        playbackRate: engine.const.zero,
      })

      binaural = engine.ear.binaural.create({
        filterModel,
      }).from(synth).to(delay.input)

      return this
    },
    destroy: function () {
      if (binaural) {
        binaural.destroy()
        binaural = undefined
      }

      if (synth) {
        synth.stop()
        synth = undefined
      }

      return this
    },
    update: function () {
      const vector = engine.tool.vector2d.unitX()
        .rotate(engine.fn.randomFloat(-1, 1) * engine.const.tau)
        .scale(engine.fn.randomFloat(-1, 1) * 10)

      const z = content.surface.value(vector)

      engine.fn.setParam(synth.param.playbackRate, engine.fn.scale(z, 0, 10, 0, 1/8))
      binaural.update(vector)

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.surface.update()
})

engine.state.on('import', () => content.audio.surface.create())
engine.state.on('reset', () => content.audio.surface.destroy())
